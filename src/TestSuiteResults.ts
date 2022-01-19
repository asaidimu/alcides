import { createTestCaseResults, TestCaseResults } from './TestCaseResults.js'

export interface TestSuiteResults {
    id: string
    results: TestCaseResults
    suites: TestSuiteResults[]
    errors: { [key: symbol]: Error }
    count: number
    passed: number
    failed: number
}

export interface TestSuiteResultsCollector {
    id: string
    results: TestCaseResults
    suites: TestSuiteResults[]
    errors: { [key: symbol]: Error }
    addTestCaseResults: (results: TestCaseResults) => void
    addTestSuiteResults: (results: TestSuiteResults) => void
    addCallBackError: (id: symbol, error: Error) => void
    getResults: () => TestSuiteResults
}

const createTestSuiteResults = ({
    results,
    id,
    suites,
    errors,
}: TestSuiteResultsCollector): TestSuiteResults => {
    return {
        id,
        results,
        errors,
        suites,
        get count(): number {
            return suites.reduce((acc, curr) => {
                return acc + curr.count
            }, results.count)
        },
        get passed(): number {
            return suites.reduce((acc, curr) => {
                return acc + curr.passed
            }, results.passed)
        },
        get failed(): number {
            return suites.reduce((acc, curr) => {
                return acc + curr.failed
            }, results.failed)
        },
    }
}

export const createTestSuiteResultsCollector = (
    id: string
): TestSuiteResultsCollector => ({
    id,
    results: createTestCaseResults(),
    suites: [],
    errors: {},
    addTestCaseResults(results: TestCaseResults) {
        this.results = results
    },
    addTestSuiteResults(results: TestSuiteResults) {
        this.suites.push(results)
    },
    addCallBackError(id: symbol, error: Error) {
        this.errors[id] = error
    },
    getResults(): TestSuiteResults {
        return createTestSuiteResults(this)
    },
})

export default createTestSuiteResultsCollector
