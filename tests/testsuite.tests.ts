import { SETUP_HOOK, TEARDOWN_HOOK } from '../src/Constants.js'
import TestCaseRunner, {
    TestCaseRunnerInterface,
} from '../src/TestCaseRunner.js'
import {
    createTestSuiteCollector,
    initTestSuite,
    TestSuiteCollector,
    TestSuiteCreator,
    TestSuite,
} from '../src/TestSuite.js'
import { run, TestSuiteResults } from '../src/TestSuiteRunner.js'

suite('Alcides TestSuite', () => {
    interface State extends TestSuiteCollector {
        testRunner: TestCaseRunnerInterface
    }

    setUp((): State => {
        return Object.assign(createTestSuiteCollector(), {
            testRunner: new TestCaseRunner(),
        })
    })

    test('Run empty suites.', async ({ testRunner }: State) => {
        const suiteResults: Array<TestSuiteResults> = await run(testRunner, [])
        assert.equal(suiteResults.length, 0)
    })

    test('Run single suites.', async ({ testRunner }: State) => {
        const suite: TestSuiteCreator = initTestSuite('A')

        suite.addTest('A', () => {})

        const testSuite: TestSuite = suite.getTestSuite()

        const suiteResults: Array<TestSuiteResults> = await run(
            testRunner,
            testSuite
        )
        assert.equal(suiteResults.length, 1)
    })

    test('Run multiple tests.', async ({
        getTestSuites,
        suite,
        test,
        testRunner,
    }: State) => {
        const [case1, case2] = ['a', 'b']

        suite('TestSuite', () => {
            test(case1, () => {
                assert.isTrue(true)
            })

            test(case2, () => {
                throw new Error('Failing Test.')
            })
        })

        const suiteResults: Array<TestSuiteResults> = await run(
            testRunner,
            getTestSuites()
        )

        const { results } = suiteResults[0]

        assert.isNull(results.find((a) => a.description == case1)!.error)
        assert.isNotNull(results.find((b) => b.description == case2)!.error)
    })

    test('Catch failing test fixtures.', async ({
        getTestSuites,
        suite,
        test,
        setUp,
        tearDown,
        testRunner,
    }: State) => {
        const [setUpError, tearDownError] = ['SetUp Error', 'TearDown Error']

        suite('TestSuite', () => {
            setUp(() => {
                throw new Error(setUpError)
            })

            tearDown(() => {
                throw new Error(tearDownError)
            })

            test('none', () => {})
        })

        const suiteResults: Array<TestSuiteResults> = await run(
            testRunner,
            getTestSuites()
        )

        const { errors } = suiteResults[0]
        assert.strictEqual(errors[SETUP_HOOK].message, setUpError)
        assert.strictEqual(errors[TEARDOWN_HOOK].message, tearDownError)
    })

    test('Run multiple test suites.', async ({
        getTestSuites,
        suite,
        test,
        testRunner,
    }: State) => {
        const id = '12345'

        suite('A', () => {
            test(id, () => {})
        })

        suite('B', () => {
            test(id, () => {})
        })

        const suiteResults: Array<TestSuiteResults> = await run(
            testRunner,
            getTestSuites()
        )

        assert.equal(suiteResults.length, 2)
    })
})
