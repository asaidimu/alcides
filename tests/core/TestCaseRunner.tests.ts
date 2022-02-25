import { SETUP_HOOK, TEARDOWN_HOOK } from '../../src/core/Constants.js'
import { runTestCase } from '../../src/core/TestCaseRunner.js'

suite('TestCaseRunner', () => {
    interface State {
        id: string
        timeout: number
        hooks: { [key: string]: TestHook }
        testCase: { (state: any): any }
    }

    setUp((): State => {
        return {
            id: 'Example',
            timeout: 1000,
            hooks: {
                [SETUP_HOOK]: () => {},
                [TEARDOWN_HOOK]: () => {},
            },
            testCase: () => {},
        }
    })

    test('Can run a testCase', async (fixture: State) => {
        const [result, error] = await runTestCase(fixture)
        assert.deepEqual(result.id, fixture.id)
        assert.deepEqual(result.id, fixture.id)
        assert.isNull(error)
    })

    test('Catch a failing test case.', async (fixture: State) => {
        const err_msg = 'Failing Test.'

        fixture.testCase = () => {
            throw new Error(err_msg)
        }

        const [_, error] = await runTestCase(fixture)

        assert.deepEqual(error!.message, err_msg)
    })

    test('Run tests asynchronously.', async (fixture: State) => {
        fixture.testCase = async () => {
            const result = await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true)
                }, 10)
            })
            assert.isFalse(result) // will throw an error
        }

        const [_, error] = await runTestCase(fixture)

        assert.isNotNull(error)
    })

    test('Test runs are timed.', async (fixture: State) => {
        const waitTime = 50

        fixture.testCase = async () => {
            await new Promise((resolve) => setTimeout(resolve, waitTime))
        }

        const [{ duration }, _] = await runTestCase(fixture)

        // could be at least 2ms late or early
        assert.isTrue(duration < waitTime + 2 || duration > waitTime - 2)
    })

    test('Long running tests fail.', async (fixture) => {
        fixture.testCase = async () => {
            await new Promise((resolve) => setTimeout(resolve, 200))
        }

        fixture.timeout = 50
        const [_, error] = await runTestCase(fixture)
        assert.isNotNull(error)
    })

    test('Run tests with hooks.', async (fixture: State) => {
        const state: number[] = []

        fixture.hooks[SETUP_HOOK] = () => {
            state.push(1)
        }

        fixture.hooks[TEARDOWN_HOOK] = () => {
            state.push(3)
        }

        fixture.testCase = () => {
            state.push(2)
        }

        await runTestCase(fixture)

        assert.deepEqual(state, [1, 2, 3])
    })

    test('State is passed from setUp down.', async (fixture: State) => {
        fixture.hooks[SETUP_HOOK] = () => ({ message: 'Hello, World!' })

        fixture.hooks[TEARDOWN_HOOK] = (opts: any) => {
            delete opts.message
        }
        fixture.testCase = async ({ message }) => {
            assert.deepEqual('Hello, World!', message)
        }

        const [_, error] = await runTestCase(fixture)
        assert.isNull(error)
    })
})
