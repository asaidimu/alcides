import { SETUP_HOOK, TEARDOWN_HOOK } from '../src/core/Constants.js'
import { TestFixture, runTestCase } from '../src/core/TestCaseRunner.js'

suite('TestCaseRunner', () => {
    interface State {
        fixture: TestFixture
    }

    setUp((): State => {
        return {
            fixture: {
                description: 'Example',
                hooks: {
                    [SETUP_HOOK]: () => {},
                    [TEARDOWN_HOOK]: () => {},
                },
                testFunction: () => {},
            },
        }
    })

    test('Can run a testCase', async ({ fixture }: State) => {
        const result = await runTestCase({ timeout: 1000, fixture })
        assert.isNull(result.error)
    })

    test('Catch a failing test case.', async ({ fixture }: State) => {
        const err_msg = 'Failing Test.'

        fixture.testFunction = () => {
            throw new Error(err_msg)
        }

        const { error } = await runTestCase({ timeout: 1000, fixture })

        assert.deepEqual(error!.message, err_msg)
    })

    test('Run tests asynchronously.', async ({ fixture }: State) => {
        fixture.testFunction = async () => {
            const result = await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true)
                }, 10)
            })
            assert.isFalse(result) // will throw an error
        }

        const { error } = await runTestCase({ timeout: 1000, fixture })

        assert.isNotNull(error)
    })

    test('Test runs are timed.', async ({ fixture }: State) => {
        const waitTime = 50

        fixture.testFunction = async () => {
            await new Promise((resolve) => setTimeout(resolve, waitTime))
        }

        const { duration } = await runTestCase({ timeout: 1000, fixture })

        // could be at least 2ms late or early
        assert.isTrue(duration < waitTime + 2 || duration > waitTime - 2)
    })

    test('Long running tests fail.', async ({ fixture }) => {
        fixture.testFunction = async () => {
            await new Promise((resolve) => setTimeout(resolve, 200))
        }

        const result = await runTestCase({ timeout: 50, fixture })
        assert.isNotNull(result.error)
    })

    test('Run tests with hooks.', async ({ fixture }: State) => {
        const state: number[] = []

        fixture.hooks[SETUP_HOOK] = () => {
            state.push(1)
        }

        fixture.hooks[TEARDOWN_HOOK] = () => {
            state.push(3)
        }

        fixture.testFunction = () => {
            state.push(2)
        }

        await runTestCase({ timeout: 1000, fixture })

        assert.deepEqual(state, [1, 2, 3])
    })

    test('State is passed from setUp down.', async () => {
        const fixture: TestFixture = {
            description: 'Example',
            hooks: {
                [SETUP_HOOK]: () => ({ message: 'Hello, World!' }),
                [TEARDOWN_HOOK]: (opts: any) => {
                    delete opts.message
                },
            },
            testFunction: async ({ message }) => {
                assert.deepEqual('Hello, World!', message)
            },
        }

        const result = await runTestCase({ timeout: 200, fixture })
        assert.isNull(result.error)
    })
})
