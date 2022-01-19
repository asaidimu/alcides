import createTestSuiteResultsCollector, {
    TestSuiteResults,
} from './TestSuiteResults.js'
import { SetUpFunction, TearDownFunction } from './Symbols.js'
import { TestSuiteResultsCollector } from './TestSuiteResults.js'
import createTestCase, { TestCaseData } from './TestCase.js'
import testCaseResultsCollector, {
    TestCaseResultsCollector,
} from './TestCaseResults.js'

import { TestSuite } from './TestSuite.js'

const callBackHasError = (
    collector: TestSuiteResultsCollector,
    callBack: Function,
    id: symbol
): boolean => {
    let result = false
    try {
        callBack()
    } catch (error) {
        result = true
        if (error instanceof Error) {
            collector.addCallBackError(id, error)
        }
    }

    return result
}

interface RunData {
    id?: string
    tests?: TestCaseData[]
    suites?: TestSuite[]
    setUp?: Function
    tearDown?: Function
}

const runTests = async (data: RunData): Promise<TestCaseResultsCollector> => {
    const { tests, setUp, tearDown } = data
    const collector = testCaseResultsCollector()
    for (const test of tests!) {
        const testCase = createTestCase(
            Object.assign(test, { setUp, tearDown })
        )
        await testCase.run(collector)
    }
    return collector
}

const runSuite = async (data: RunData): Promise<TestSuiteResults> => {
    const results = createTestSuiteResultsCollector(data.id || '')

    if (
        data.tests &&
        !callBackHasError(results, data.setUp!, SetUpFunction) &&
        !callBackHasError(results, data.tearDown!, TearDownFunction)
    ) {
        const collector = await runTests(data)
        results.addTestCaseResults(collector.results)
    }

    if (data.suites) {
        for (const suite of data.suites) {
            const res = await runSuite(suite)
            results.addTestSuiteResults(res)
        }
    }

    return results.getResults()
}

export const run = async (data: TestSuite[]): Promise<TestSuiteResults[]> => {
    const { suites } = await runSuite({ suites: data })
    return suites
}

export default run
