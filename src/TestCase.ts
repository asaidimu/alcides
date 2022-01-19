import { TestResultsCollector } from './TestResults.js'

export interface TestCaseData {
    id: string
    testFunction: Function
    setUp: Function
    tearDown: Function
}

export interface TestCase {
    run: Function
}

export default (data: TestCaseData): TestCase => {
    const { testFunction, id, setUp, tearDown } = data
    return {
        run({ testPassed, testFailed }: TestResultsCollector) {
            setUp()
            try {
                testFunction()
                testPassed(id)
            } catch (error) {
                testFailed(id, error)
            } finally {
                tearDown()
            }
        },
    }
}
