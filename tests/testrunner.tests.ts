import { TestSuiteResults } from '../src/TestSuiteRunner.js'
import { TestRunner, TestRunnerInterface } from '../src/TestRunner.js'

suite('Alcides Test Runner', () => {
    interface State {
        runner: TestRunnerInterface
    }

    setUp((): State => {
        const runner = new TestRunner({
            include: ['assets/tests'],
            timeout: 2000,
            workers: 2,
            parallel: false,
        })
        return { runner }
    })
    test('List test files.', async ({ runner }: State) => {
        const testFiles: Array<string> = await runner.findTests()
        assert.equal(testFiles.length, 10)
    })

    test('Run test from files.', async ({ runner }: State) => {
        const results: Array<TestSuiteResults> = await runner.run()
        assert.equal(results.length, 10)
    })

    /* test('Run tests in parallel', async () => {
        const runner = new TestRunner({
            include: ['assets/tests'],
            timeout: 2000,
            workers: 2,
            parallel: true
        })

        const results: Array<TestSuiteResults> = await runner.run()
        assert.equal(results.length, 10)
    }) */
})
