import { SETUP_HOOK, TEARDOWN_HOOK } from './Constants.js'
import { invalidActionError } from '../Errors.js'
import { assert } from 'chai'

export const initTestSuite = (id: string): TestSuiteCreator => {
    const tests: TestCase[] = []
    const hooks: { [key: string]: TestHook } = {
        [SETUP_HOOK]: () => {},
        [TEARDOWN_HOOK]: () => {},
    }

    return {
        getTestSuite(): TestSuite {
            return {
                id,
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
        addTest(id: string, testCase: TestFunction) {
            tests.push({
                id,
                testCase,
            })
        },
        get id() {
            return id
        },
    }
}

export const createTestSuiteCollector = (): any => {
    const stack: Array<TestSuiteCreator> = []
    let all: Array<TestSuiteCreator> = []
    let current: TestSuiteCreator | null = null

    return [
        {
            suite(id: string, fn: Function) {
                if (current !== null) {
                    stack.push(current)
                }
                current = initTestSuite(id)

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
            test(id: string, testFunction: TestFunction) {
                if (current === null) {
                    throw invalidActionError('test()')
                }
                current.addTest(id, testFunction)
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

interface CollectOpts {
    tests: Array<string>
}

type CollectResults = Promise<TestCollectorResults>

export const collect = async ({ tests }: CollectOpts): CollectResults => {
    const [opts, getSuites] = createTestSuiteCollector()
    Object.assign(global, opts, { assert })

    const errors = (
        await Promise.allSettled(tests.map((file) => import(file)))
    ).reduce((all: any, curr: any) => {
        if (curr.status == 'rejected') {
            const error: TestError = curr.reason
            all.push(error)
        }
        return all
    }, [])

    return { suites: getSuites(), errors }
}
