import { timeoutError } from './Errors.js'
import { EVENT_TEST_RUN_TIMEOUT } from './Symbols.js'
import { TestFunction, TestCase } from './TestCase.js'

import { setTimeout } from 'timers/promises'

interface CodedError extends Error {
    code?: string | symbol
}

export type TestResult = {
    error: CodedError | null

    duration: number
    description: string
}

export interface TestFixture extends TestCase {
    setUp: Function

    tearDown: Function

    testFunction: TestFunction
}

export interface TestCaseRunnerConfig {
    timeout: number
}

export interface TestCaseRunnerInterface {
    run: Function
    config: TestCaseRunnerConfig
}

const defaultConfig: TestCaseRunnerConfig = {
    timeout: 1000,
}

export class TestCaseRunner implements TestCaseRunnerInterface {
    private configs: TestCaseRunnerConfig

    constructor(config: TestCaseRunnerConfig = defaultConfig) {
        this.configs = config
    }

    async run(test: TestFixture): Promise<TestResult> {
        let error: Error | null = null

        const state = await test.setUp()

        const ac = new AbortController()

        const { timeout } = this.configs

        let duration = performance.now()
        try {
            const result = await Promise.race([
                test.testFunction(state),
                setTimeout(timeout, EVENT_TEST_RUN_TIMEOUT, {
                    signal: ac.signal,
                    ref: false,
                }),
            ])

            if (result == EVENT_TEST_RUN_TIMEOUT) {
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
    }

    get config(): TestCaseRunnerConfig {
        return this.configs
    }
}

export default TestCaseRunner
