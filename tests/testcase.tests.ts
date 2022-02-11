import { ERR_TEST_RUN_TIMEOUT } from '../src/Constants.js'
import TestCaseRunner, {
    TestFixture,
    TestResult,
} from '../src/TestCaseRunner.js'

suite('Alcides TestCase', () => {
    interface State {
        runner: TestCaseRunner
        createTest: (opts: any) => TestFixture
    }

    setUp(
        (): State => ({
            createTest({
                setUp = false,
                tearDown = false,
                testFunction = false,
            } = {}) {
                return {
                    description: 'Random Test',
                    setUp: setUp ? setUp : () => {},
                    tearDown: tearDown ? tearDown : () => {},
                    testFunction: testFunction ? testFunction : () => {},
                }
            },
            runner: new TestCaseRunner(),
        })
    )

    test('Run a test case.', async ({ runner, createTest }: State) => {
        const state: number[] = []

        const result: TestResult = await runner.run(
            createTest({
                testFunction: () => {
                    state.push(1)
                },
            })
        )

        assert.deepEqual(state, [1])
        assert.isNull(result.error)
    })

    test('Catch a failing test case.', async ({
        runner,
        createTest,
    }: State) => {
        const err_msg = 'Failing Test.'

        const { error }: TestResult = await runner.run(
            createTest({
                testFunction: () => {
                    throw new Error(err_msg)
                },
            })
        )

        assert.deepEqual(error?.message, err_msg)
    })

    test('Run tests asynchronously.', async ({ runner, createTest }: State) => {
        const { error }: TestResult = await runner.run(
            createTest({
                testFunction: async () => {
                    const result = await new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(true)
                        }, 10)
                    })
                    assert.isFalse(result)
                },
            })
        )

        assert.isNotNull(error)
    })

    test('Test runs are timed.', async ({ runner, createTest }: State) => {
        const waitTime = 50

        const test = createTest({
            testFunction: async () => {
                await new Promise((resolve) => setTimeout(resolve, waitTime))
            },
        })

        const { duration }: TestResult = await runner.run(test)

        // could be at least 2ms late or early
        assert.isTrue(duration < waitTime + 2 || duration > waitTime - 2)
    })

    test('Fail long running tests.', async ({ createTest }: State) => {
        const runner = new TestCaseRunner({ timeout: 5 })

        const { error }: TestResult = await runner.run(
            createTest({
                testFunction: async () => {
                    await new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(true)
                        }, 20)
                    })
                },
            })
        )

        assert.deepEqual(error!.code, ERR_TEST_RUN_TIMEOUT)
    })

    test('Run tests with fixtures.', async ({ runner, createTest }: State) => {
        const state: number[] = []

        await runner.run(
            createTest({
                setUp: () => {
                    state.push(1)
                },
                testFunction: () => {
                    state.push(2)
                },
                tearDown: () => {
                    state.push(3)
                },
            })
        )

        assert.deepEqual(state, [1, 2, 3])
    })

    test('Pass state from setUp down.', async ({
        createTest,
        runner,
    }: State) => {
        const message = 'This is not an error.'

        const { error } = await runner.run(
            createTest({
                setUp: () => {
                    return { message }
                },
                tearDown: (state: any) => {
                    delete state.message
                },
                testFunction: async ({ message }: any) => {
                    throw new Error(message)
                },
            })
        )

        //verify thrown error contains message from setUp
        assert.deepEqual(error!.message, message)
    })
})
