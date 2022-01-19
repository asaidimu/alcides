import { assert } from 'chai'
import createTestCase from '../src/TestCase.js'
import TestSuiteCreator, { TestSuite } from '../src/TestSuite.js'
import run from '../src/TestRunner.js'
import { SetUpFunction, TearDownFunction } from '../src/Symbols.js'
import testCaseResultsCollector from '../src/TestCaseResults.js'

suite('Aclides test suite', () => {
    test('Run a test case', async () => {
        const collector = testCaseResultsCollector()

        let wasRun = false
        const testCase = createTestCase({
            id: 'Run a test case.',
            testFunction: () => {
                wasRun = true
            },
        })

        await testCase.run(collector)

        assert.isTrue(wasRun)
    })

    test('Catch failing tests', async () => {
        const testCase = createTestCase({
            id: 'Failing test.',
            testFunction: () => {
                throw new Error('Failing test case.')
            },
        })
        const collector = testCaseResultsCollector()
        await testCase.run(collector)
        const { count, passed, failed } = collector.results
        assert.deepEqual(
            { count, passed, failed },
            { count: 1, passed: 0, failed: 1 }
        )
    })

    test('Record test results', async () => {
        const testCase = createTestCase({
            id: 'Example test case',
            testFunction: () => {},
        })

        const collector = testCaseResultsCollector()
        await testCase.run(collector)
        const { count, passed, failed } = collector.results
        assert.deepEqual(
            { count, passed, failed },
            { count: 1, passed: 1, failed: 0 }
        )
    })

    test('Run multiple test cases.', async () => {
        const { createTestSuite, addTestCase, getTestSuites } =
            TestSuiteCreator()

        createTestSuite('Example test suite', () => {
            addTestCase('Test Function 1', () => {})
            addTestCase('Test Function 2', () => {
                throw new Error('Test function.')
            })
        })

        const testSuites: TestSuite[] = getTestSuites()
        const res = await run(testSuites)
        const { results } = res[0]
        const { count, passed, failed } = results
        assert.deepEqual(
            { count, passed, failed },
            { count: 2, passed: 1, failed: 1 }
        )
    })

    test('Run each test case in order', async () => {
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
        await run(testSuites)
        /*
         * the first 1, and 3 will be added as the
         * callbacks are being checked for errors
         * */
        assert.deepEqual(state, [1, 3, 1, 2, 3])
    })

    test('Catch failing setUps', async () => {
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
        const res = await run(testSuites)
        const { errors } = res[0]
        assert.deepEqual(errors[SetUpFunction].message, message)
    })

    test('Catch failing tearDowns', async () => {
        const {
            createTestSuite,
            addTestCase,
            addSetUp,
            addTearDown,
            getTestSuites,
        } = TestSuiteCreator()

        const message = 'Failing Tear Down'
        createTestSuite('', () => {
            addSetUp(() => null)
            addTestCase('', () => null)
            addTearDown(() => {
                throw new Error(message)
            })
        })
        const testSuites: TestSuite[] = getTestSuites()
        const res = await run(testSuites)
        const { errors } = res[0]
        assert.deepEqual(errors[TearDownFunction].message, message)
    })

    test('Load Suites from a test folder', async () => {
        /*
        const dir = "/tmp/tmp.ttVaP6l97P/tests"
        const load = createTestLoader()

        const testSuites = await load(dir)
        const res = await run(testSuites)
        const { results } = res[0]
        const { count, passed, failed } = results
        assert.deepEqual(
            { count, passed, failed },
            { count: 1, passed: 1, failed: 0 }
        )
        */
    })
})
