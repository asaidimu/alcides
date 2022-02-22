import { timeoutError } from '../Errors.js'
import { SETUP_HOOK, TEARDOWN_HOOK, TIMEOUT } from './Constants.js'
import { TestFunction, TestCase } from './TestCase.js'
import { TestHook } from './TestSuite.js'

import { setTimeout } from 'timers/promises'

export interface CodedError extends Error {
    code?: string
    position?: any
}

export type TestResult = {
    error: CodedError | null
    duration: number
    description: string
}

export interface TestFixture extends TestCase {
    hooks: { [key: string]: TestHook }
    testFunction: TestFunction
}

const runTestFunction = async (opts: any) => {
    const { description, state, signal, testFunction, timeout } = opts

    const res = await Promise.race([
        testFunction(state),
        setTimeout(timeout, TIMEOUT, {
            signal: signal,
            ref: false,
        }),
    ])

    if (res == TIMEOUT) {
        throw timeoutError(description)
    }
}

interface runOpts {
    fixture: TestFixture
    timeout: number
}

type runResults = Promise<TestResult>
export const runTestCase = async (opts: runOpts): runResults => {
    const { timeout, fixture } = opts
    const hooks = fixture.hooks
    const ac = new AbortController()

    const result: TestResult = {
        description: fixture.description,
        duration: 0,
        error: null,
    }

    const state = await hooks[SETUP_HOOK]()

    try {
        result.duration = performance.now()
        await runTestFunction({
            description: result.description,
            signal: ac.signal,
            testFunction: fixture.testFunction,
            timeout,
            state,
        })
    } catch (e: any) {
        result.error = e instanceof Error ? e : new Error(e)
    } finally {
        result.duration = performance.now() - result.duration
        ac.abort()
        hooks[TEARDOWN_HOOK](state)
    }

    return result
}

export default runTestCase
