import { parentPort, workerData } from 'worker_threads'
import TestCaseRunner from './TestCaseRunner.js'
import { createTestSuiteCollector, TestSuiteCollector } from './TestSuite.js'
import run, { TestSuiteResults } from './TestSuiteRunner.js'
import { assert } from 'chai'
import { RUN } from './Constants.js'

const serializeErrors = (
    results: Array<TestSuiteResults>
): Array<TestSuiteResults> => {
    /* Assertation errors from chai aren't passed very well. */
    const serialized = results.map((suiteResult) => {
        const { results } = suiteResult

        suiteResult.results = results.map((result) => {
            const { error } = result
            if (error !== null) {
                result.error = {
                    stack: error.stack,
                    name: error.name,
                    message: error.message,
                    code: error.code,
                }
            }
            return result
        })
        return suiteResult
    })
    return serialized
}

const importTestFile = async (file: string): Promise<any> => {
    try {
        await import(file)
    } catch (e) {
        /* handle error */
    }
}

const main = async () => {
    const { config, paths } = workerData
    const { getTestSuites, suite, test, setUp, tearDown }: TestSuiteCollector =
        createTestSuiteCollector()

    Object.assign(global, { suite, test, setUp, tearDown, assert })

    for (const testFile of paths) {
        await importTestFile(testFile)
    }

    const results = await run(new TestCaseRunner(config), getTestSuites())

    parentPort?.postMessage(serializeErrors(results))
}

parentPort!.on('message', (msg) => {
    if (msg === RUN) main()
})
