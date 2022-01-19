import { assert } from 'chai'
import createTestCase from '../src/TestCase.js'
import TestSuiteCreator, { TestSuite } from '../src/TestSuite.js'
import report from '../src/TestResultsReporter.js'
import run from '../src/TestRunner.js'
import { SetUpFunction, TearDownFunction } from '../src/Symbols.js'
import testCaseResultsCollector from '../src/TestCaseResults.js'
import { TestSuiteResults } from '../src/TestSuiteResults.js'

const { createTestSuite, addTestCase, getTestSuites } = TestSuiteCreator()

createTestSuite('Aclides test suite', () => {
    addTestCase('Run a test case', () => {
        const collector = testCaseResultsCollector()

        let wasRun = false
        const testCase = createTestCase({
            id: 'Run a test case.',
            testFunction: () => {
                wasRun = true
            },
        })
        testCase.run(collector)

        assert.isTrue(wasRun)
    })

    addTestCase('Catch failing tests', () => {
        const testCase = createTestCase({
            id: 'Failing test.',
            testFunction: () => {
                throw new Error('Failing test case.')
            },
        })
        const collector = testCaseResultsCollector()
        testCase.run(collector)
        const { count, passed, failed } = collector.results
        assert.deepEqual(
            { count, passed, failed },
            { count: 1, passed: 0, failed: 1 }
        )
    })

    addTestCase('Record test results', () => {
        const testCase = createTestCase({
            id: 'Example test case',
            testFunction: () => {},
        })

        const collector = testCaseResultsCollector()
        testCase.run(collector)
        const { count, passed, failed } = collector.results
        assert.deepEqual(
            { count, passed, failed },
            { count: 1, passed: 1, failed: 0 }
        )
    })

    addTestCase('Run multiple test cases.', () => {
        const { createTestSuite, addTestCase, getTestSuites } =
            TestSuiteCreator()

        createTestSuite('Example test suite', () => {
            addTestCase('Test Function 1', () => {})
            addTestCase('Test Function 2', () => {
                throw new Error('Test function.')
            })
        })

        const testSuites: TestSuite[] = getTestSuites()
        const { results } = run(testSuites)[0]
        const { count, passed, failed } = results
        assert.deepEqual(
            { count, passed, failed },
            { count: 2, passed: 1, failed: 1 }
        )
    })

    addTestCase('Run each test case in order', () => {
        const {
            createTestSuite,
            addTestCase,
            addSetUp,
            addTearDown,
            getTestSuites,
        } = TestSuiteCreator()

        const state: number[] = []
        createTestSuite('Run in order', () => {
            addSetUp(() => state.push(1))
            addTestCase('Push 2', () => state.push(2))
            addTearDown(() => state.push(3))
        })
        const testSuites: TestSuite[] = getTestSuites()
        run(testSuites)
        /*
         * the first 1, and 3 will be added as the
         * callbacks are being checked for errors
         * */
        assert.deepEqual(state, [1, 3, 1, 2, 3])
    })

    addTestCase('Catch failing setUps', () => {
        const {
            createTestSuite,
            addTestCase,
            addSetUp,
            addTearDown,
            getTestSuites,
        } = TestSuiteCreator()

        const message = 'Failing Set Up'
        createTestSuite('Run in order', () => {
            addSetUp(() => {
                throw new Error(message)
            })
            addTestCase('Not goin to run.', () => null)
            addTearDown(() => null)
        })
        const testSuites: TestSuite[] = getTestSuites()
        const { errors } = run(testSuites)[0]
        assert.deepEqual(errors[SetUpFunction].message, message)
    })

    addTestCase('Catch failing tearDowns', () => {
        const {
            createTestSuite,
            addTestCase,
            addSetUp,
            addTearDown,
            getTestSuites,
        } = TestSuiteCreator()

        const message = 'Failing Tear Down'
        createTestSuite('Run in order', () => {
            addSetUp(() => null)
            addTestCase('', () => null)
            addTearDown(() => {
                throw new Error(message)
            })
        })
        const testSuites: TestSuite[] = getTestSuites()
        const { errors } = run(testSuites)[0]
        assert.deepEqual(errors[TearDownFunction].message, message)
    })
})

const testSuites: TestSuite[] = getTestSuites()
const testSuiteResults: TestSuiteResults[] = run(testSuites)
report(testSuiteResults)
