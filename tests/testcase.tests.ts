import { EVENT_RUNNER_DONE } from '../src/Symbols.js'
import TestCase from '../src/TestCase.js'
import TestCaseRunner, { TestResult } from '../src/TestCaseRunner.js'
import {
    createTestSuiteCollector,
    TestSuiteCollector,
} from '../src/TestSuite.js'
import TestSuiteRunner, { TestSuiteResults } from '../src/TestSuiteRunner.js'

suite('Alcides TestCase', () => {
    test('Run a test case.', async () => {
        const state: number[] = []

        const testCase: TestCase = {
            description: 'Assert true is true.',
            testFunction: () => {
                state.push(1)
            },
        }

        const runner = new TestCaseRunner()

        const result: TestResult = await runner.run({
            description: '',
            testFunction: testCase.testFunction,
            setUp: () => {},
            tearDown: () => {},
        })

        assert.deepEqual(state, [1])
        assert.isNull(result.error)
    })

    test('Catch a failing test case.', async () => {
        const err_msg = 'Failing Test.'

        const runner = new TestCaseRunner()

        const { error }: TestResult = await runner.run({
            description: '',
            testFunction: () => {
                throw new Error(err_msg)
            },
            setUp: () => {},
            tearDown: () => {},
        })

        assert.deepEqual(error?.message, err_msg)
    })

    test('Pass state from setUp down.', async () => {
        const { getTestSuites, suite, test, setUp }: TestSuiteCollector =
            createTestSuiteCollector()

        const message = 'This is not an error.'
        const id = '12345'

        suite('A', () => {
            setUp(() => {
                //returned object will be passed down to each testCase
                return { message }
            })

            test(id, async ({ message }: any) => {
                //We throw the message so that we can catch it and verify the
                //message.
                throw new Error(message)
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

        //verify thrown error contains message from setUp
        assert.deepEqual(error!.message, message)
    })

    test('Fail long running tests.', async () => {
        const { getTestSuites, suite, test }: TestSuiteCollector =
            createTestSuiteCollector()

        const id = '12345'

        suite('A', () => {
            test(id, async () => {
                const result = await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(true)
                    }, 100)
                })
                assert.isTrue(result)
            })
        })

        const runner = new TestSuiteRunner(
            new TestCaseRunner({
                timeout: 50,
            })
        )

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

    test('Test runs are timed.', async () => {
        const { getTestSuites, suite, test }: TestSuiteCollector =
            createTestSuiteCollector()

        const id = 'Example'
        const waitTime = 50

        suite(id, () => {
            test(id, async () => {
                await new Promise((resolve) => setTimeout(resolve, waitTime))
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
        const { duration } = results[id]
        assert.isAbove(duration + 1, waitTime)
    })
})
