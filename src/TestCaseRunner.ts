import { timeoutError } from './Errors.js'
import { EVENT_TEST_RUN_TIMEOUT } from './Symbols.js'
import { TestFunction, TestCase } from './TestCase.js'

import { setTimeout } from 'timers/promises'

interface CodedError extends Error {
    code?: string | symbol
}

/**
 * Results returned for each tes case that is run.
 * @typedef TestCaseResult
 * @name TestCaseResult
 * @memberof TestCase
 */
export type TestResult = {
    /**
     * If the test failed, contains the error that was thrown. Otherwise is
     * null.
     * @name error
     */
    error: CodedError | null

    /**
     * Time it took the test to run
     * @name duration
     */
    duration: number
    description: string
}

/**
 * Callbacks that represent a complete text fixture.
 * @typedef TestCaseFixture
 * @name TestCaseFixture
 * @memberof TestCaseRunner
 */
export interface TestFixture extends TestCase {
    /**
     * Run once before the testFunction to set up the environment.
     * @name setUp
     * @function
     * @param void
     * @returns void
     */
    setUp: Function

    /**
     * Run upon the completion or failure of the testFunction. Resets the environment.
     *
     * @name tearDown
     * @function
     * @param void
     * @returns void
     */
    tearDown: Function

    /**
     * Callback containing test algorithm.
     * @function
     * @name testFunction
     * @param void
     * @returns void
     */
    testFunction: TestFunction
}

/**
 * TestCaseRunnerConfig
 */
export interface TestCaseRunnerConfig {
    /**
     * Timeout before a running test is stopped
     */
    timeout: number
}

/**
 * TestCaseRunner
 * @interface
 */
export interface TestCaseRunnerInterface {
    /**
     * Runs a TestCase
     * @function run
     * @param { TestFixture } fixtures - a test case environment.
     * @returns { TestResult } testResult - results of the test run.
     * @memberof TestCaseRunner
     */
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
