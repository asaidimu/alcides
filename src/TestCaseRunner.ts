import { EventEmitter } from 'stream'
import { timeoutError } from './Errors.js'
import { EVENT_TEST_RUN_COMPLETE, EVENT_TEST_RUN_TIMEOUT } from './Symbols.js'
import { TestFunction, TestCase } from './TestCase.js'

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
    error: Error | null

    /**
     * Time it took the test to run
     * @name duration
     */
    duration: number
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

    async run(test: TestFixture, events?: EventEmitter): Promise<TestResult> {
        let error: Error | null = null

        const state = await test.setUp()

        let duration = performance.now()

        try {
            await this.runTestFunction(test, state)
        } catch (e: any) {
            error = e instanceof Error ? e : new Error(e)
        } finally {
            duration = performance.now() - duration
            test.tearDown()
        }

        const result = { duration, error }

        if (events) {
            events.emit(EVENT_TEST_RUN_COMPLETE, {
                description: test.description,
                result,
            })
        }

        return result
    }

    private async runTestFunction(test: TestFixture, state: any) {
        const { timeout } = this.configs

        const result = await Promise.race([
            test.testFunction(state),
            new Promise((reject) => {
                setTimeout(() => reject(EVENT_TEST_RUN_TIMEOUT), timeout)
            }),
        ])

        if (result === EVENT_TEST_RUN_TIMEOUT) {
            throw timeoutError(test.description)
        }
    }

    get config(): TestCaseRunnerConfig {
        return this.configs
    }
}

export default TestCaseRunner
