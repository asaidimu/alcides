import { timeoutError } from './Errors.js'
import { SETUP_HOOK, TEARDOWN_HOOK, TIMEOUT } from './Constants.js'
import { setTimeout } from 'timers/promises'

interface TestDecoratorParams {
    testCase: { (args: any): any | Promise<any> }
    timeout?: number
    hooks?: { [key: string]: TestHook }
    id?: string
}

interface DecoratedFunction {
    (args?: any): Promise<any | void>
}

interface TimerResults {
    duration: number
}

interface ErrorHandlerResults {
    error: TestError | null
}

export const withTimeOut = ({
    testCase,
    timeout,
}: TestDecoratorParams): DecoratedFunction => {
    return async function (...args): Promise<any> {
        const ac = new AbortController()

        const res = await Promise.race([
            testCase(...args),
            setTimeout(timeout, TIMEOUT, {
                signal: ac.signal,
                ref: false,
            }),
        ])

        ac.abort()

        if (res == TIMEOUT) {
            throw timeoutError()
        }

        return res
    }
}

export const withTimer = ({
    testCase,
}: TestDecoratorParams): DecoratedFunction => {
    return async function (...args): Promise<TimerResults & Object> {
        let duration = performance.now()
        const results = await testCase(...args)
        duration = performance.now() - duration
        return Object.assign({ duration }, results)
    }
}

export const withErrorHandler = ({
    testCase,
    id,
}: TestDecoratorParams): DecoratedFunction => {
    return async function (...args): Promise<ErrorHandlerResults & Object> {
        let error: TestError | null = null
        let results: any
        try {
            results = await testCase(...args)
        } catch (e: any) {
            error = e instanceof Error ? e : new Error(e)
            error.id = id
        }

        return Object.assign({ error }, results)
    }
}

export const withBeforeAndAfterHooks = ({
    testCase,
    hooks,
}: TestDecoratorParams): DecoratedFunction => {
    return async function (): Promise<any> {
        const state = await hooks![SETUP_HOOK]()
        const results = await testCase(state)
        await hooks![TEARDOWN_HOOK](state)
        return results
    }
}

export const decorateTestFunction = ({
    testCase,
    timeout,
    hooks,
}: TestDecoratorParams): DecoratedFunction => {
    const timed = withTimer({ testCase })
    const limited = withTimeOut({ testCase: timed, timeout })
    const handled = withErrorHandler({ testCase: limited })
    return withBeforeAndAfterHooks({ testCase: handled, hooks })
}
