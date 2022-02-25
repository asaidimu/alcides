import { timeoutError } from '../Errors.js'
import { SETUP_HOOK, TEARDOWN_HOOK, TIMEOUT } from './Constants.js'
import { TestFunction, TestCase } from './TestCase.js'
import { TestHook } from './TestSuite.js'

import { setTimeout } from 'timers/promises'

export interface TestError extends Error {
    id?: string
    code?: string
    stack?: string
    position?: {
        source: string
        line: number
        column: number
    }
}

/** @deprecated */
export interface CodedError extends TestError {}

export interface TestResult {
    id: string
    duration: number
    passed: boolean
}

export interface TestFixture extends TestCase {
    hooks: { [key: string]: TestHook }
    testFunction: TestFunction
}

const runTestFunction = async (opts: any) => {
    const { state, signal, testFunction, timeout } = opts

    const res = await Promise.race([
        testFunction(state),
        setTimeout(timeout, TIMEOUT, {
            signal: signal,
            ref: false,
        }),
    ])

    if (res == TIMEOUT) {
        throw timeoutError()
    }
}

interface runOpts {
    fixture: TestFixture
    timeout: number
}

type runResults = Promise<[TestResult, Error | null]>
export const runTestCase = async (opts: runOpts): runResults => {
    const { timeout, fixture } = opts
    const hooks = fixture.hooks
    const ac = new AbortController()

    const result: TestResult = {
        id: fixture.id,
        duration: 0,
        passed: false,
    }

    let error: TestError | null = null

    const state = await hooks[SETUP_HOOK]()

    try {
        result.duration = performance.now()
        await runTestFunction({
            signal: ac.signal,
            testFunction: fixture.testFunction,
            timeout,
            state,
        })
        result.passed = true
    } catch (e: any) {
        error = e instanceof Error ? e : new Error(e)
        error.id = fixture.id
    } finally {
        result.duration = performance.now() - result.duration
        ac.abort()
        hooks[TEARDOWN_HOOK](state)
    }

    return [result, error]
}

export default runTestCase
