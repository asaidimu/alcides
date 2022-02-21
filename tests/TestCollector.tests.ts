import { find } from '../src/core/File.js'
import {
    collect,
    createTestSuiteCollector,
    TestCollectorResults,
} from '../src/core/TestCollector.js'

suite('TestCollector.', () => {
    test('Collector methods can build TestSuite', async () => {
        const [utils, getSuites] = createTestSuiteCollector()
        const { suite, setUp, test, tearDown } = utils

        suite('TestSuite', () => {
            setUp(() => {})
            tearDown(() => {})
            test('Example', () => {})
        })

        const suites = getSuites()
        assert.equal(1, suites.length)

        const testSuite = suites[0]

        assert.deepEqual('TestSuite', testSuite.description)
        assert.equal(1, testSuite.tests.length)
    })

    test('TestCollector can collect tests.', async () => {
        const tests = await find({ globs: ['assets/tests/**/*.test.js'] })
        const { suites, errors }: TestCollectorResults = await collect({
            tests,
        })
        assert.equal(suites.length, 8)
        assert.equal(Object.entries(errors).length, 1)
    })
})
