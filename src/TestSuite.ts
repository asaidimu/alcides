import TestCase, { TestFunction, TestHook } from '../src/TestCase.js'
import { invalidActionError } from './Errors.js'
import { getSymbolName, SETUP_HOOK, TEARDOWN_HOOK } from './Constants.js'

export interface SuiteFunction {
    (description: string, cb: () => void): void
}

export interface TestFunctionHook {
    (description: string, cb: TestFunction): void
}

export interface SetUpHook {
    (cb: TestHook): void
}

export interface TearDownHook {
    (cb: TestHook): void
}

export interface TestSuiteCollector {
    suite: SuiteFunction
    test: TestFunctionHook
    setUp: SetUpHook
    tearDown: TearDownHook
    getTestSuites: { (): Array<TestSuite> }
}

export interface TestSuite {
    description: string

    tests: TestCase[]

    setUp: TestHook

    tearDown: TestHook
}

export type TestSuiteErrors = { [key: string]: Error }

export interface TestSuiteCreator {
    addTest: (description: string, testFunction: TestFunction) => void

    addHook: (id: string, fun: TestHook) => void

    getTestSuite: () => TestSuite

    description: string
}

export const initTestSuite = (description: string): TestSuiteCreator => {
    const tests: TestCase[] = []

    const hooks: { [key: string]: TestHook } = {}

    return {
        getTestSuite(): TestSuite {
            const setUp = hooks[SETUP_HOOK] || (() => {})
            const tearDown = hooks[TEARDOWN_HOOK] || (() => {})

            return {
                description,
                tests,
                setUp,
                tearDown,
            }
        },
        addHook(id: string, fun: TestHook) {
            if (hooks[id]) {
                throw invalidActionError(getSymbolName(id))
            }

            fun.id = id
            hooks[id] = fun
        },
        addTest(description: string, testFunction: TestFunction) {
            tests.push({
                description,
                testFunction,
            })
        },
        get description() {
            return description
        },
    }
}

export const createTestSuiteCollector = (): TestSuiteCollector => {
    const stack: Array<TestSuiteCreator> = []
    let all: Array<TestSuiteCreator> = []
    let current: TestSuiteCreator | null = null

    return {
        suite(description: string, fn: Function) {
            if (current !== null) {
                stack.push(current)
            }
            current = initTestSuite(description)

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
            current.addTest(description, testFunction)
        },
        tearDown(fn: TestHook) {
            if (current === null) {
                throw invalidActionError('tearDown()')
            }
            current.addHook(TEARDOWN_HOOK, fn)
        },
        setUp(fn: TestHook) {
            if (current === null) {
                throw invalidActionError('setUp()')
            }

            current.addHook(SETUP_HOOK, fn)
        },
        getTestSuites(): Array<TestSuite> {
            const suites = all.reduce(
                (acc: Array<TestSuite>, curr: TestSuiteCreator) => {
                    acc.push(curr.getTestSuite())
                    return acc
                },
                []
            )

            all = []

            return suites
        },
    }
}
export default initTestSuite
