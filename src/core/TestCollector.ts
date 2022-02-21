import { SETUP_HOOK, TEARDOWN_HOOK } from './Constants.js'
import { invalidActionError } from '../Errors.js'
import { TestFunction, TestCase } from './TestCase.js'
import { TestSuite, TestHook } from './TestSuite.js'
import { assert } from 'chai'

export interface TestCollectorInterface {
    suite: { (description: string, cb: () => void): void }
    test: { (description: string, cb: TestFunction): void }
    setUp: { (cb: () => any | Promise<any>): void }
    tearDown: { (cb: (state?: any) => void | Promise<void>): void }
}

export interface TestSuiteCreator {
    addTest: (description: string, testFunction: TestFunction) => void
    addHook: (id: string, fun: TestHook) => void
    getTestSuite: () => TestSuite
    description: string
}
export const initTestSuite = (description: string): TestSuiteCreator => {
    const tests: TestCase[] = []
    const hooks: { [key: string]: TestHook } = {
        [SETUP_HOOK]: () => {},
        [TEARDOWN_HOOK]: () => {},
    }

    return {
        getTestSuite(): TestSuite {
            return {
                description,
                tests,
                hooks,
            }
        },
        addHook(id: string, fun: TestHook) {
            if (hooks[id] && hooks[id].id == id) {
                throw invalidActionError(id)
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

export const createTestSuiteCollector = (): any => {
    const stack: Array<TestSuiteCreator> = []
    let all: Array<TestSuiteCreator> = []
    let current: TestSuiteCreator | null = null

    return [
        {
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
        },

        (): Array<TestSuite> => {
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
    ]
}

export interface TestCollectorResults {
    suites: Array<TestSuite>
    errors: { [key: string]: any }
}

interface CollectOpts {
    tests: Array<string>
}

type CollectResults = Promise<TestCollectorResults>

export const collect = async ({ tests }: CollectOpts): CollectResults => {
    const [opts, getSuites] = createTestSuiteCollector()
    Object.assign(global, opts, { assert })

    const errors = (
        await Promise.allSettled(tests.map((file) => import(file)))
    ).reduce((all: any, curr: any, index: any) => {
        if (curr.status == 'rejected') all[tests[index]] = curr.reason
        return all
    }, {})

    return { suites: getSuites(), errors }
}
