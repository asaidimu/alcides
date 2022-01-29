import { EVENT_RUNNER_DONE, SETUP_HOOK, TEARDOWN_HOOK } from '../src/Symbols.js'
import TestCaseRunner from '../src/TestCaseRunner.js'
import {
    createTestSuiteCollector,
    TestSuiteCollector,
} from '../src/TestSuite.js'
import TestSuiteRunner, { TestSuiteResults } from '../src/TestSuiteRunner.js'

suite('Alcides TestSuite', () => {
    test('Run multiple tests cases.', async () => {
        const { getTestSuites, suite, test }: TestSuiteCollector =
            createTestSuiteCollector()

        const [case1, case2] = ['a', 'b']

        suite('TestSuite', () => {
            test(case1, () => {
                assert.isTrue(true)
            })

            test(case2, () => {
                throw new Error('Failing Test.')
            })
        })

        const runner = new TestSuiteRunner(new TestCaseRunner())

        runner.add(getTestSuites())

        const suiteResults: Array<TestSuiteResults> = await new Promise(
            (resolve) => {
                runner.on(EVENT_RUNNER_DONE, resolve)
                runner.run()
            }
        )

        const { results } = suiteResults[0]
        assert.isNull(results[case1].error)
        assert.isNotNull(results[case2].error)
    })

    test('Run tests with fixtures.', async () => {
        const {
            getTestSuites,
            suite,
            test,
            setUp,
            tearDown,
        }: TestSuiteCollector = createTestSuiteCollector()
        const state: number[] = []
        const id = 'qwerty'

        suite('TestSuite', () => {
            setUp(() => {
                state.push(1)
            })

            tearDown(() => {
                state.push(3)
            })

            test(id, () => {
                state.push(2)
            })
        })

        const runner = new TestSuiteRunner(new TestCaseRunner())
        runner.add(getTestSuites())

        const suiteResults: Array<TestSuiteResults> = await new Promise(
            (resolve) => {
                runner.on(EVENT_RUNNER_DONE, resolve)
                runner.run()
            }
        )

        const { results } = suiteResults[0]
        assert.isNull(results[id].error)
        assert.deepEqual(state, [1, 3, 1, 2, 3])
    })

    test('Catch failing test fixtures.', async () => {
        const {
            getTestSuites,
            suite,
            test,
            setUp,
            tearDown,
        }: TestSuiteCollector = createTestSuiteCollector()
        const [setUpError, tearDownError] = ['SetUp Error', 'TearDown Error']

        suite('TestSuite', () => {
            setUp(() => {
                throw new Error(setUpError)
            })

            tearDown(() => {
                throw new Error(tearDownError)
            })

            test('none', () => {})
        })

        const runner = new TestSuiteRunner(new TestCaseRunner())
        runner.add(getTestSuites())

        const suiteResults: Array<TestSuiteResults> = await new Promise(
            (resolve) => {
                runner.on(EVENT_RUNNER_DONE, resolve)
                runner.run()
            }
        )

        const { errors } = suiteResults[0]
        assert.strictEqual(errors[SETUP_HOOK].message, setUpError)
        assert.strictEqual(errors[TEARDOWN_HOOK].message, tearDownError)
    })

    test('Run tests asynchronously.', async () => {
        const { getTestSuites, suite, test }: TestSuiteCollector =
            createTestSuiteCollector()
        const id = '12335'

        suite('TestSuite', () => {
            test(id, async () => {
                const result = await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(true)
                    }, 100)
                })
                assert.isFalse(result)
            })
        })

        const runner = new TestSuiteRunner(new TestCaseRunner())
        runner.add(getTestSuites())

        const suiteResults: Array<TestSuiteResults> = await new Promise(
            (resolve) => {
                runner.on(EVENT_RUNNER_DONE, resolve)
                runner.run()
            }
        )

        const { results } = suiteResults[0]
        const { error } = results[id]

        assert.isNotNull(error)
    })

    test('Run multiple test suites.', async () => {
        const { getTestSuites, suite, test }: TestSuiteCollector =
            createTestSuiteCollector()

        const id = '12345'

        suite('A', () => {
            test(id, () => {})
        })

        suite('B', () => {
            test(id, () => {})
        })

        const runner = new TestSuiteRunner(new TestCaseRunner())
        runner.add(getTestSuites())

        const suiteResults: Array<TestSuiteResults> = await new Promise(
            (resolve) => {
                runner.on(EVENT_RUNNER_DONE, resolve)
                runner.run()
            }
        )

        assert.equal(suiteResults.length, 2)
    })
})
