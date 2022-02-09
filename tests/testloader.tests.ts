import TestLoader, { TestLoaderInterface } from '../src/TestLoader.js'
import { TestSuiteResults } from '../src/TestSuiteRunner.js'

suite('Alcides Suite Loader', () => {
    setUp(() => {
        const loader: TestLoaderInterface = new TestLoader({
            include: ['assets/tests'],
            workers: 2,
            testCaseRunnerConfig: { timeout: 2000 },
        })

        return { loader }
    })

    test('Suite loader can list files.', async ({ loader }: any) => {
        const testFiles: Array<string> = await loader.findTests()
        assert.equal(testFiles.length, 10)
    })

    test('Suite loader can run tests.', async ({ loader }: any) => {
        const suiteResults: Array<TestSuiteResults> = await loader.run()
        assert.equal(suiteResults.length, 10)
    })

    test('Can run tests in parallel', async ({ loader }: any) => {
        const suiteResults: Array<TestSuiteResults> =
            await loader.runParallell()
        assert.equal(suiteResults.length, 10)
    })
})
