import { timeoutError } from './Errors.js'
import { TIMEOUT } from './Constants.js'
import { TestFunction, TestCase, TestHook } from './TestCase.js'

import { setTimeout } from 'timers/promises'

interface CodedError extends Error {
    code?: string
}

export type TestResult = {
    error: CodedError | null

    duration: number
    description: string
}

export interface TestFixture extends TestCase {
    setUp: TestHook

    tearDown: TestHook

    testFunction: TestFunction
}

export interface TestCaseRunnerConfig {
    timeout: number
}

export interface TestCaseRunnerInterface {
    run: { (test: TestFixture): Promise<TestResult> }
}

const defaultConfig: TestCaseRunnerConfig = {
    timeout: 1000,
}

const testCaseRunner = ({
    timeout,
}: TestCaseRunnerConfig): TestCaseRunnerInterface => {
    return {
        async run(test: TestFixture): Promise<TestResult> {
            let error: Error | null = null
            let duration: number = 0

            const ac = new AbortController()

            const state = await test.setUp()
            try {
                duration = performance.now()

                const result = await Promise.race([
                    test.testFunction(state),
                    setTimeout(timeout, TIMEOUT, {
                        signal: ac.signal,
                        ref: false,
                    }),
                ])

                if (result == TIMEOUT) {
                    throw timeoutError(test.description)
                }
            } catch (e: any) {
                error = e instanceof Error ? e : new Error(e)
            } finally {
                duration = performance.now() - duration
                ac.abort()
                test.tearDown(state)
            }

            return { description: test.description, duration, error }
        },
    }
}

export class TestCaseRunner implements TestCaseRunnerInterface {
    private runner: TestCaseRunnerInterface

    constructor(config: TestCaseRunnerConfig = defaultConfig) {
        this.runner = testCaseRunner(config)
    }

    async run(test: TestFixture): Promise<TestResult> {
        return this.runner.run(test)
    }
}

export default TestCaseRunner
