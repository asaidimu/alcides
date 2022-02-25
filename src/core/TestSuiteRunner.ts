import runTestCase from './TestCaseRunner.js'

const promiseToResult = ({ status, value, reason }: any) => {
    return status == 'fulfilled' ? value : reason
}

type checkOpts = { [key: string]: TestHook }
type checkResults = Promise<Array<TestError>>

export const checkHooks = async (hooks: checkOpts): checkResults => {
    const errors: Array<TestError> = []
    for (const hook of Object.values(hooks)) {
        try {
            await hook()
        } catch (e: any) {
            const error: TestError = e instanceof Error ? e : new Error(e)
            error.id = hook.id
            errors.push(error)
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

    let result: TestSuiteResults = {
        id: suite.id,
        results: [],
        errors: {
            hook: [],
            test: [],
        },
    }

    if (tests.length === 0) {
        return result
    }

    const errors = await checkHooks(hooks)

    if (errors.length !== 0) {
        result.errors.hook = errors
        return result
    }

    const testResults = await Promise.allSettled(
        tests.map(({ id, testCase }) =>
            runTestCase({ timeout, id, testCase, hooks })
        )
    )

    result = testResults
        .map(promiseToResult)
        .reduce(
            (
                all: TestSuiteResults,
                [result, error]: [TestResult, TestError | null]
            ) => {
                all.results.push(result)
                if (error != null) all.errors.test.push(error)

                return all
            },
            result
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
    const results = await Promise.allSettled(
        suites.map((suite) => run({ suite, timeout }))
    )
    return results.map(promiseToResult)
}

export default runTestSuite
