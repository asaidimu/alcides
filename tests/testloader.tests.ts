import TestLoader, { TestLoaderInterface } from '../src/TestLoader.js'
import { TestSuiteResults } from '../src/TestSuiteRunner.js'

suite('Alcides Suite Loader', () => {
    test('Suite loader can list files.', async () => {
        const loader: TestLoaderInterface = new TestLoader({
            include: ['assets'],
            workers: 2,
        })

        const testFiles: Array<string> = await loader.findTests()

        assert.equal(testFiles.length, 10)
    })

    test('Suite loader can run tests.', async () => {
        const loader: TestLoaderInterface = new TestLoader({
            include: ['assets'],
            workers: 2,
        })

        const suiteResults: Array<TestSuiteResults> = await loader.run()
        assert.equal(suiteResults.length, 10)
    })

    test('Can run tests in parallel', async () => {
        const loader: TestLoaderInterface = new TestLoader({
            include: ['assets'],
            workers: 2,
            testCaseRunnerConfig: { timeout: 2000 },
        })

        const suiteResults: Array<TestSuiteResults> =
            await loader.runParallell()
        assert.equal(suiteResults.length, 10)
    })
})
