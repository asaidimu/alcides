import { TestResult, TestCaseRunnerInterface } from './TestCaseRunner.js'
import { TestHook, TestSuite, TestSuiteErrors } from './TestSuite.js'

export type TestSuiteResults = {
    description: string
    results: Array<TestResult>

    errors: TestSuiteErrors
}

export interface TestSuiteRunner {
    (testRunner: TestCaseRunnerInterface, suite: Array<TestSuite>): Promise<
        Array<TestSuiteResults>
    >
}

export const checkFixtures = async (
    fs: TestHook[]
): Promise<TestSuiteErrors> => {
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

export const runSuite = async (
    suite: TestSuite,
    runner: TestCaseRunnerInterface
): Promise<TestSuiteResults> => {
    const { setUp, tearDown, tests } = suite

    const result: TestSuiteResults = {
        description: suite.description,
        results: [],
        errors: {},
    }

    if (tests.length === 0) {
        return result
    }

    const errors = await checkFixtures([setUp, tearDown])

    if (Object.entries(errors).length !== 0) {
        result.errors = errors
        return result
    }

    result.results = await Promise.all(
        tests.map(({ description, testFunction }) =>
            runner.run({ description, testFunction, setUp, tearDown })
        )
    )

    return result
}

export async function run(
    runner: TestCaseRunnerInterface,
    suite: TestSuite | Array<TestSuite>
): Promise<Array<TestSuiteResults>> {
    const suites = Array.isArray(suite) ? suite : [suite]

    return Promise.all(suites.map((suite) => runSuite(suite, runner)))
}

export default run
