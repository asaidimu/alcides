import { EventEmitter } from 'events'
import {
    EVENT_RUNNER_DONE,
    EVENT_TEST_RUN_COMPLETE,
    EVENT_SUITE_RUN_COMPLETE,
    EVENT_SUITE_RUN_DONE,
} from './Symbols.js'
import { TestResult, TestCaseRunnerInterface } from './TestCaseRunner.js'
import { TestHook, TestSuite, TestSuiteErrors } from './TestSuite.js'

/**
 * Results for each test suite run.
 *
 * @name TestSuiteResults
 */
export type TestSuiteResults = {
    /**
     * The description of the test suite.
     */
    description: string
    /**
     * A collection of results for each test case in the suite.
     * @see TestCaseResult
     */
    results: { [key: string]: TestResult }

    /**
     * Errors that occurred  during the test suite run.
     */
    errors: TestSuiteErrors
}

/**
 * @name TestSuiteRunner @interface TestSuiteRunner
 */
export interface TestSuiteRunnerInterface {
    /**
     * runs a TestSuite
     * @function
     * @name run
     * @returns  void
     */
    run: Function

    /**
     * Allows callbacks to be attached to an internal event emmitter
     * @function
     * @name add
     * @param { TestSuite } testSuite - test suite to be run
     * @returns  void
     */
    add: Function

    /**
     * Allows callbacks to be attached to an internal event emmitter
     * @function
     * @name on
     * @param { Symbol } eventSymbol - symbol for which to add event listener
     * @param { Function } callBack - callBack to run on event.
     * @returns  void
     */
    on: Function
}

export class TestSuiteRunner implements TestSuiteRunnerInterface {
    private events: EventEmitter
    private runner: TestCaseRunnerInterface
    private testSuites: Array<TestSuite> = []
    private results: Array<TestSuiteResults> = []

    constructor(testCaseRunner: TestCaseRunnerInterface) {
        this.events = new EventEmitter()
        this.runner = testCaseRunner
        this.initEvents()
    }

    private initEvents() {
        this.events.on(EVENT_SUITE_RUN_DONE, (results: TestSuiteResults) => {
            this.results.push(results)
            if (this.results.length === this.testSuites.length) {
                this.events.emit(EVENT_RUNNER_DONE, Array.from(this.results))
                this.results = []
            }
        })
    }

    /**
     * Check that test fixtures don't fail.
     *
     * @name checkFixtures
     * @function checkFixtures
     * @params { Object } fixtures
     * @returns { TestSuiteErrors } - @see TestSuiteErrors
     * @private
     */
    private async checkFixtures(fs: TestHook[]): Promise<TestSuiteErrors> {
        const errors: TestSuiteErrors = {}
        for (const hook of fs) {
            try {
                await hook()
            } catch (error: any) {
                if (error instanceof Error) {
                    errors[hook.id!] = error
                } else {
                    errors[hook.id!] = new Error(error)
                }
            }
        }

        return errors
    }

    private initRunnerState({ description, tests }: TestSuite) {
        const events = new EventEmitter()

        const state: any = {
            description,
            total: tests.length,
            results: {},
        }

        events.on(EVENT_TEST_RUN_COMPLETE, ({ description, result }) => {
            state.results[description] = <TestResult>result
            if (Object.values(state.results).length === state.total) {
                events.emit(EVENT_SUITE_RUN_DONE)
            }
        })

        events.on(EVENT_SUITE_RUN_DONE, (errors?: TestSuiteErrors) => {
            const result: TestSuiteResults = {
                description: state.description,
                results: state.results,
                errors: errors ? errors : {},
            }

            events.emit(EVENT_SUITE_RUN_COMPLETE, result)
        })

        return { events, state }
    }

    private async runSuite(suite: TestSuite, events: EventEmitter) {
        if (suite.tests.length === 0) {
            return events.emit(EVENT_SUITE_RUN_DONE)
        }

        const { setUp, tearDown } = suite

        const errors = await this.checkFixtures([setUp, tearDown])

        if (Object.entries(errors).length !== 0) {
            return events.emit(EVENT_SUITE_RUN_DONE, errors)
        }

        suite.tests.forEach(({ description, testFunction }) => {
            this.runner.run(
                {
                    description,
                    setUp: setUp,
                    tearDown: tearDown,
                    testFunction,
                },
                events
            )
        })
    }

    private async runAll() {
        this.testSuites.forEach((suite) => {
            const { events } = this.initRunnerState(suite)

            events.on(EVENT_SUITE_RUN_COMPLETE, (results: TestSuiteResults) => {
                this.events.emit(EVENT_SUITE_RUN_DONE, results)
            })

            this.runSuite(suite, events)
        })
    }

    add(suite: TestSuite | Array<TestSuite>) {
        if (Array.isArray(suite)) {
            this.testSuites = this.testSuites.concat(suite)
        } else {
            this.testSuites.push(suite)
        }
    }

    on(event: symbol, cb: any) {
        this.events.addListener(event, cb)
    }

    get run() {
        return this.runAll
    }
}
export default TestSuiteRunner
