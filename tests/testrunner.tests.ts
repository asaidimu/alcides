import { TestRunner, TestRunnerInterface } from '../src/TestRunner.js'

suite('Alcides Test Runner', () => {
    interface State {
        runner: TestRunnerInterface
    }

    setUp((): State => {
        // TODO: Break up config.
        const runner = new TestRunner({
            include: ['assets/tests'],
            timeout: 2000,
            workers: 2,
            parallel: false,
            watch: false,
            files: [],
        })
        return { runner }
    })

    test('List test files.', async ({ runner }: State) => {
        const testFiles: Array<string> = await runner.findTests()
        assert.equal(testFiles.length, 10)
    })

    test('Run test from files.', async ({ runner }: State) => {
        const results = await runner.run()
        assert.equal(results!.length, 10)
    })

    /* test('Run tests in parallel', async () => { }) */
})
