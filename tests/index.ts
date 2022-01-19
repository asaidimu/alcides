import { assert } from 'chai'
import createTestCase from '../src/TestCase.js'
import createResultsCollector from '../src/TestResults.js'
import createTestSuite from '../src/TestSuite.js'
import report from '../src/TestResultsReporter.js'

const { suite, test, run, setUp } = createTestSuite()

suite('Aclides test suite', () => {
    test('Run a test case', () => {
        const collector = createResultsCollector()

        let wasRun = false
        const testCase = createTestCase({
            id: 'Run a test case.',
            setUp: () => {},
            tearDown: () => {},
            testFunction: () => {
                wasRun = true
            },
        })
        testCase.run(collector)

        assert.isTrue(wasRun)
    })

    test('Catch failing tests', () => {
        const testCase = createTestCase({
            id: 'Failing test.',
            setUp: () => {},
            tearDown: () => {},
            testFunction: () => {
                throw new Error('Failing test case.')
            },
        })
        const collector = createResultsCollector()
        testCase.run(collector)
        const { count, passed, failed } = collector.getResults()
        assert.deepEqual(
            { count, passed, failed },
            { count: 1, passed: 0, failed: 1 }
        )
    })

    test('Record test results', () => {
        const testCase = createTestCase({
            id: 'Example test case',
            setUp: () => {},
            tearDown: () => {},
            testFunction: () => {},
        })

        const collector = createResultsCollector()
        testCase.run(collector)
        const { count, passed, failed } = collector.getResults()
        assert.deepEqual(
            { count, passed, failed },
            { count: 1, passed: 1, failed: 0 }
        )
    })

    test('Run multiple test cases.', () => {
        const { suite, test, run } = createTestSuite()

        suite('Example test suite', () => {
            test('Test Function 1', () => {})
            test('Test Function 2', () => {
                throw new Error('Test function.')
            })
        })

        const { count, passed, failed } = run()[0]
        assert.deepEqual(
            { count, passed, failed },
            { count: 2, passed: 1, failed: 1 }
        )
    })

    test('Run each test case in order', () => {
        const { suite, test, run, setUp, tearDown } = createTestSuite()

        const state: number[] = []
        suite('Run in order', () => {
            setUp(() => state.push(1))
            test('Push 2', () => state.push(2))
            tearDown(() => state.push(3))
        })
        run()
        assert.deepEqual(state, [1, 3, 1, 2, 3])
    })

    test('Catch failing setUps', () => {
        const { suite, test, run, setUp, tearDown } = createTestSuite()

        const message = 'Failing SetUp'
        suite('Run in order', () => {
            setUp(() => {
                throw new Error(message)
            })
            test('Not goin to run.', () => null)
            tearDown(() => null)
        })
        const { results } = run()[0]
        const { errors } = results
        assert.deepEqual(errors['setUp'].message, message)
    })

    test('Catch failing tearDowns', () => {
        const { suite, test, run, setUp, tearDown } = createTestSuite()

        const message = 'Failing tearDown'
        suite('Run in order', () => {
            setUp(() => null)
            test('Not goin to run.', () => null)
            tearDown(() => {
                throw new Error(message)
            })
        })
        const { results } = run()[0]
        const { errors } = results
        assert.deepEqual(errors['tearDown'].message, message)
    })
})

const results = run()
report(results)
