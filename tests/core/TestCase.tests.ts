import {
    ERR_TEST_TIMEOUT,
    SETUP_HOOK,
    TEARDOWN_HOOK,
} from '../../src/core/Constants.js'
import {
    withBeforeAndAfterHooks,
    withErrorHandler,
    withTimeOut,
    withTimer,
} from '../../src/core/TestCase.js'

suite('TestCase Decorators', () => {
    interface State {
        timeout: number
        testCase: TestFunction
    }
    setUp(
        (): State => ({
            timeout: 100,
            testCase: async () => {
                return await new Promise((resolve) => setTimeout(resolve, 50))
            },
        })
    )

    test('withTimout throws a time out error.', async (state: State) => {
        let error: TestError | null = null

        state.timeout = 20

        const decoratedTestFunction = withTimeOut(state)
        try {
            await decoratedTestFunction()
        } catch (e) {
            error = <TestError>e
        }

        assert.isNotNull(error)
        assert.deepEqual(ERR_TEST_TIMEOUT, error?.code)
    })

    test('withTimer adds a timer to the test function.', async (state: State) => {
        const decoratedTestFunction = withTimer(state)

        const result = await decoratedTestFunction()

        assert.isNumber(result.duration)
    })

    test('withErrorHandler should catch errors.', async (state: State) => {
        state.timeout = 20

        const decoratedTestFunction = withErrorHandler({
            testCase: withTimeOut(state), // will throw a timeout error.
            id: 'ABC',
        })

        const { error }: { error: TestError } = await decoratedTestFunction()

        assert.isNotNull(error)
        assert.deepEqual(ERR_TEST_TIMEOUT, error?.code)
        assert.deepEqual('ABC', error?.id)
    })

    test('withBeforeAndAfterHooks; run setUp first and tearDown last.', async () => {
        const array: Array<number> = []

        const state: {
            testCase: TestFunction
            hooks: { [key: string]: TestHook }
        } = {
            testCase: async () => {
                array.push(2)
            },
            hooks: {
                [SETUP_HOOK]: () => array.push(1),
                [TEARDOWN_HOOK]: () => array.push(3),
            },
        }

        const decoratedTestFunction = withBeforeAndAfterHooks(state)

        await decoratedTestFunction()

        assert.deepEqual([1, 2, 3], array)
    })
})
