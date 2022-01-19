export interface TestCaseResults {
    passedTests: string[]
    failedTests: { [key: string]: Error }
    count: number
    passed: number
    failed: number
}

export const createTestCaseResults = (): TestCaseResults => ({
    passedTests: [],
    failedTests: {},
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

export interface TestCaseResultsCollector {
    results: TestCaseResults
    testPassed: Function
    testFailed: Function
}

export const testCaseResultsCollector = (): TestCaseResultsCollector => {
    const results: TestCaseResults = createTestCaseResults()

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
    }
}

export default testCaseResultsCollector
