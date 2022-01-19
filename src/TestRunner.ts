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

const runTests = (data: RunData): TestCaseResultsCollector => {
    const { tests, setUp, tearDown } = data
    const collector = testCaseResultsCollector()
    for (const test of tests!) {
        createTestCase(Object.assign(test, { setUp, tearDown })).run(collector)
    }
    return collector
}

const runSuite = (data: RunData): TestSuiteResults => {
    const results = createTestSuiteResultsCollector(data.id || '')

    if (
        data.tests &&
        !callBackHasError(results, data.setUp!, SetUpFunction) &&
        !callBackHasError(results, data.tearDown!, TearDownFunction)
    ) {
        results.addTestCaseResults(runTests(data).results)
    }

    if (data.suites) {
        for (const suite of data.suites) {
            results.addTestSuiteResults(runSuite(suite))
        }
    }

    return results.getResults()
}

export const run = (data: TestSuite[]): TestSuiteResults[] => {
    const { suites } = runSuite({ suites: data })
    return suites
}

export default run
