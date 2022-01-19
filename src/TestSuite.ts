import {
    TestSuiteResults,
    TestResultsCollector,
    createTestSuiteResultsCollector,
} from './TestResults.js'
import createResultsCollector from './TestResults.js'
import createTestCase from './TestCase.js'
import { TestCaseData } from './TestCase.js'

export interface TestSuite {
    suite: (id: string, fn: Function) => void
    test: (id: string, fn: Function) => void
    run: () => TestSuiteResults[]
    setUp: (fn: Function) => void
    tearDown: (fn: Function) => void
}

export interface TestSuiteData {
    id: string
    hasSetup: boolean
    hasTearDown: boolean
    setUp: () => void | false
    tearDown: () => void | false
    tests: TestCaseData[]
    suites: TestSuiteData[]
}

export default (): TestSuite => {
    const stack: any[] = []

    let data: any = null

    const suites: any[] = []

    const startSuite = (id: string) => {
        if (data !== null) {
            stack.push(data)
        }

        data = {
            hasSetup: false,
            hasTearDown: false,
            id,
            setUp: () => {},
            tearDown: () => {},
            tests: [],
            suites: [],
        }
    }

    const endSuite = () => {
        if (stack.length != 0) {
            stack[stack.length - 1].suites.push(data)
            data = stack.pop()
        } else {
            suites.push(data)
            data = null
        }
    }

    return {
        suite(id: string, fn: Function) {
            startSuite(id)
            fn()
            endSuite()
        },
        test(id: string, testFunction: Function) {
            data.tests.push({
                id,
                testFunction,
            })
        },
        setUp(fn: Function) {
            if (data.hasSetUp) {
                throw new Error('Cannot call setUp twice.')
            } else {
                data.setUp = fn
                data.hasSetup = true
            }
        },
        tearDown(fn: Function) {
            if (data.hasTearDown) {
                throw new Error('Cannot call tearDown twice.')
            } else {
                data.tearDown = fn
                data.hasTearDown = true
            }
        },
        run(): TestSuiteResults[] {
            const callBackHasError = (
                { callBackFailed }: TestResultsCollector,
                callBack: Function,
                id: string
            ): boolean => {
                let result = false
                try {
                    callBack()
                } catch (error) {
                    result = true
                    callBackFailed(id, error)
                }

                return result
            }

            const runSuite = ({
                tests = false,
                id = '',
                setUp,
                tearDown,
                suites,
            }: any): TestSuiteResults => {
                const results = createTestSuiteResultsCollector(id)

                if (tests) {
                    const collector = createResultsCollector()
                    if (
                        !callBackHasError(collector, setUp, 'setUp') &&
                        !callBackHasError(collector, tearDown, 'tearDown')
                    ) {
                        for (const test of tests) {
                            createTestCase(
                                Object.assign(test, { setUp, tearDown })
                            ).run(collector)
                        }
                    }
                    results.addTestCaseResults(collector.getResults())
                }

                for (const suite of suites) {
                    results.addTestSuiteResults(runSuite(suite))
                }

                return results.getResults()
            }

            const results = runSuite({ suites })
            return results.suites
        },
    }
}
