import { SETUP_HOOK, TEARDOWN_HOOK } from '../../src/core/Constants.js'
import { createTestSuiteCollector } from '../../src/core/TestCollector.js'
import runTestSuite from '../../src/core/TestSuiteRunner.js'

suite('TestSuiteRunner', () => {
    setUp((): any => {
        const [utils, getSuites] = createTestSuiteCollector()
        return { utils, getSuites }
    })

    test('Run empty suites.', async () => {
        const results: Array<TestSuiteResults> = await runTestSuite({
            timeout: 1000,
            suite: [],
        })
        assert.equal(results.length, 0)
    })

    test('Run single suites.', async ({ utils, getSuites }: any) => {
        utils.suite('Example', () => {
            utils.test('E', () => {})
        })

        const results: Array<TestSuiteResults> = await runTestSuite({
            timeout: 1000,
            suite: getSuites(),
        })
        assert.equal(results.length, 1)
    })

    test('Run multiple tests.', async ({ getSuites, utils }: any) => {
        const [case1, case2] = ['a', 'b']
        const { suite, test } = utils
        suite('TestSuite', () => {
            test(case1, () => {
                assert.isTrue(true)
            })

            test(case2, () => {
                throw new Error('Failing Test.')
            })
        })

        const suiteResults: Array<TestSuiteResults> = await runTestSuite({
            timeout: 1000,
            suite: getSuites(),
        })

        const { results } = suiteResults[0]

        assert.isTrue(results.find((i) => i.id == case1)?.passed)
        assert.isFalse(results.find((i) => i.id == case2)?.passed)
    })

    test('Catch failing test fixtures.', async ({ getSuites, utils }: any) => {
        const [setUpError, tearDownError] = ['SetUp Error', 'TearDown Error']

        const { test, setUp, tearDown, suite } = utils
        suite('TestSuite', () => {
            setUp(() => {
                throw new Error(setUpError)
            })

            tearDown(() => {
                throw new Error(tearDownError)
            })

            test('none', () => {})
        })

        const suiteResults: Array<TestSuiteResults> = await runTestSuite({
            timeout: 1000,
            suite: getSuites(),
        })

        const { errors } = suiteResults[0]
        assert.strictEqual(
            errors.hook.find((e) => e.id == SETUP_HOOK)!.message,
            setUpError
        )
        assert.strictEqual(
            errors.hook.find((e) => e.id == TEARDOWN_HOOK)!.message,
            tearDownError
        )
    })

    test('Run multiple test suites.', async ({ getSuites, utils }: any) => {
        const id = '12345'

        const { test, suite } = utils
        suite('A', () => {
            test(id, () => {})
        })

        suite('B', () => {
            test(id, () => {})
        })

        const suiteResults: Array<TestSuiteResults> = await runTestSuite({
            timeout: 1000,
            suite: getSuites(),
        })

        assert.equal(suiteResults.length, 2)
    })
})
