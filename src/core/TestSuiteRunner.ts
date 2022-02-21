import runTestCase, { TestResult } from './TestCaseRunner.js'
import { TestHook, TestSuite } from './TestSuite.js'

export type TestSuiteErrors = { [key: string]: Error }

export type TestSuiteResults = {
    description: string
    results: Array<TestResult>

    errors: TestSuiteErrors
}

type checkOpts = { [key: string]: TestHook }
type checkResults = Promise<TestSuiteErrors>

export const checkHooks = async (hooks: checkOpts): checkResults => {
    const errors: TestSuiteErrors = {}
    for (const hook of Object.values(hooks)) {
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

interface runSuiteOpts {
    timeout: number
    suite: TestSuite
}

type runSuiteResult = Promise<TestSuiteResults>

export const run = async ({ timeout, suite }: runSuiteOpts): runSuiteResult => {
    const { hooks, tests } = suite

    const result: TestSuiteResults = {
        description: suite.description,
        results: [],
        errors: {},
    }

    if (tests.length === 0) {
        return result
    }

    const errors = await checkHooks(hooks)

    if (Object.entries(errors).length !== 0) {
        result.errors = errors
        return result
    }

    result.results = await Promise.all(
        tests.map(({ description, testFunction }) =>
            runTestCase({
                timeout,
                fixture: {
                    description,
                    testFunction,
                    hooks,
                },
            })
        )
    )

    return result
}

interface runOpts {
    timeout: number
    suite: Array<TestSuite> | TestSuite
}

type runResults = Promise<Array<TestSuiteResults>>
export async function runTestSuite({ timeout, suite }: runOpts): runResults {
    const suites = Array.isArray(suite) ? suite : [suite]

    return Promise.all(suites.map((suite) => run({ suite, timeout })))
}

export default runTestSuite
