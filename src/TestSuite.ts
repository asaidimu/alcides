import TestCase, { TestFunction } from '../src/TestCase.js'
import { invalidActionError } from './Errors.js'
import { getSymbolName, SETUP_HOOK, TEARDOWN_HOOK } from './Symbols.js'

/**
 * Defines a collection of test suites related by fixtures
 *
 * @name TestSuite
 * @namespace TestSuite
 * @memberof TestSuite
 */
export type TestSuite = {
    /**
     * The description of the testCase. Use as a unique id.
     */
    description: string

    /**
     * Array containing TestCases
     */
    tests: TestCase[]

    /**
     * Callback that sets up fixtures. Run once before each testCase.
     */
    setUp: TestHook

    /**
     * Callback that clears fixtures. Run once before each testCase.
     */
    tearDown: TestHook
}

/**
 * A collection of errors that occurred while the test suite was being run.
 *
 * @name TestSuiteErrors
 * @memberof TestSuite
 */
export type TestSuiteErrors = { [key: symbol | string]: Error }

/**
 * Exposes methods used to create test suites.
 * @interface
 * @name TestSuiteCreator
 * @memberof TestSuite
 */
export interface TestSuiteCreator {
    /**
     * Adds a test case to the test suite
     */
    addTestCase: (description: string, testFunction: TestFunction) => void
    /**
     * Adds a setUp callback to the suite. Should be callable only once.
     */
    addSetUp: (fn: Function) => void
    /**
     * Adds a tearDown callback to the suite. Should be callable only once.
     */
    addTearDown: (fn: Function) => void
    /**
     * Returns test suite data.
     */
    getTestSuite: () => TestSuite
}

/**
 * Describes a fixture function
 *
 * @name FixtureFunction
 * @memberof TestSuite
 */
export type TestHook = {
    /**
     * The function
     */
    (): any

    /**
     * The id of the function.
     */
    id?: symbol | string
}

/**
 * Exposes an implementation of the TestSuiteCreator interface
 *
 * @name initTestSuiteCreator
 * @function initTestSuiteCreator
 * @param { string } description - the description of the testSuite
 * @memberof TestSuite
 */
const initTestSuiteCreator = (description: string): TestSuiteCreator => {
    const tests: TestCase[] = []

    const hooks: { [key: string]: TestHook } = {
        setUp: function () {},
        tearDown: function () {},
    }

    const addHook = (id: symbol | string, name: string, fun: TestHook) => {
        if (hooks[name].id === id) {
            throw invalidActionError(getSymbolName(id))
        }

        fun.id = id
        hooks[name] = fun
    }

    return {
        getTestSuite(): TestSuite {
            return {
                description,
                tests,
                setUp: hooks['setUp'],
                tearDown: hooks['tearDown'],
            }
        },
        addTestCase(description: string, testFunction: TestFunction) {
            tests.push({
                description,
                testFunction,
            })
        },
        addSetUp(fn: Function) {
            addHook(SETUP_HOOK, 'setUp', <TestHook>fn)
        },
        addTearDown(fn: Function) {
            addHook(TEARDOWN_HOOK, 'tearDown', <TestHook>fn)
        },
    }
}

export interface TestSuiteCollector {
    suite: Function
    test: Function
    setUp: Function
    tearDown: Function
    getTestSuites: Function
}

export const createTestSuiteCollector = (): TestSuiteCollector => {
    const stack: Array<TestSuiteCreator> = []
    const all: Array<TestSuiteCreator> = []
    let current: TestSuiteCreator | null = null

    return {
        suite(description: string, fn: Function) {
            if (current !== null) {
                stack.push(current)
            }
            current = initTestSuiteCreator(description)

            fn()

            if (stack.length > 0) {
                const prev = <TestSuiteCreator>stack.pop()
                all.push(current)
                current = prev
            } else {
                all.push(current)
                current = null
            }
        },
        test(description: string, testFunction: TestFunction) {
            if (current === null) {
                throw invalidActionError('test()')
            }
            current.addTestCase(description, testFunction)
        },
        tearDown(fn: Function) {
            if (current === null) {
                throw invalidActionError('tearDown()')
            }
            current.addTearDown(fn)
        },
        setUp(fn: Function) {
            if (current === null) {
                throw invalidActionError('setUp()')
            }
            current.addSetUp(fn)
        },
        getTestSuites(): Array<TestSuite> {
            const suites = all.reduce(
                (acc: Array<TestSuite>, curr: TestSuiteCreator) => {
                    acc.push(curr.getTestSuite())
                    return acc
                },
                []
            )

            return suites
        },
    }
}
/** @see initTestSuiteCreator */
export default initTestSuiteCreator
