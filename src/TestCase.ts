import { TestCaseResultsCollector } from './TestCaseResults.js'

export interface TestCaseData {
    id: string
    testFunction: Function
    setUp?: Function
    tearDown?: Function
}

export interface TestCase {
    run: Function
}

export const createTestCase = (data: TestCaseData): TestCase => {
    const { testFunction, id, setUp = () => {}, tearDown = () => {} } = data
    return {
        run({ testPassed, testFailed }: TestCaseResultsCollector) {
            setUp!()
            try {
                testFunction()
                testPassed(id)
            } catch (error) {
                testFailed(id, error)
            } finally {
                tearDown!()
            }
        },
    }
}

export default createTestCase
