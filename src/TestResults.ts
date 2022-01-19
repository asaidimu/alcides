export interface TestResults {
    passedTests: string[]
    failedTests: { [key: string]: Error }
    errors: { [key: string]: Error }
    count: number
    passed: number
    failed: number
}

export const createTestResults = (): TestResults => ({
    passedTests: [],
    failedTests: {},
    errors: {},
    get count(): number {
        return this.passedTests.length + Object.entries(this.failedTests).length
    },
    get passed(): number {
        return this.passedTests.length
    },
    get failed(): number {
        return Object.entries(this.failedTests).length
    },
})

export interface TestSuiteResults {
    id: string
    results: TestResults
    suites: TestSuiteResults[]
    count: number
    passed: number
    failed: number
}

export interface TestSuiteResultsCollector {
    id: string
    results: TestResults
    suites: TestSuiteResults[]
    addTestCaseResults: (results: TestResults) => void
    addTestSuiteResults: (results: TestSuiteResults) => void
    getResults: () => TestSuiteResults
}

const createTestSuiteResults = ({
    results,
    id,
    suites,
}: TestSuiteResultsCollector): TestSuiteResults => {
    return {
        id,
        results,
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
    results: createTestResults(),
    suites: [],
    addTestCaseResults(results: TestResults) {
        this.results = results
    },
    addTestSuiteResults(results: TestSuiteResults) {
        this.suites.push(results)
    },
    getResults(): TestSuiteResults {
        return createTestSuiteResults(this)
    },
})

export interface TestResultsCollector {
    results: TestResults
    testPassed: Function
    testFailed: Function
    callBackFailed: (id: string, error: any) => void
    getResults: () => TestResults
}

export default (): TestResultsCollector => {
    const results: TestResults = createTestResults()

    return {
        get results() {
            return results
        },
        testFailed(id: string, error: Error) {
            results.failedTests[id] = error
        },
        testPassed(id: string) {
            results.passedTests.push(id)
        },
        getResults(): TestResults {
            return results
        },
        callBackFailed(id: string, error: any) {
            results.errors[id] = error
        },
    }
}
