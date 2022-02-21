import { parentPort, workerData } from 'worker_threads'
import runTestSuite, { TestSuiteResults } from './TestSuiteRunner.js'
import { RUN } from './Constants.js'
import { collect } from './TestCollector.js'

const serializeError = (error: any): any => {
    let result: any = error
    if (error !== null) {
        result = {
            stack: error.stack,
            name: error.name,
            message: error.message,
            code: error.code,
        }
    }
    return result
}

const serializeResultErrors = (
    results: Array<TestSuiteResults>
): Array<TestSuiteResults> => {
    /* Assertation errors from chai aren't cloned very well. */
    const serialized = results.map((suiteResult) => {
        const { results } = suiteResult
        suiteResult.results = results.map((result) => {
            const { error } = result
            result.error = serializeError(error)
            return result
        })
        return suiteResult
    })
    return serialized
}

const serializeCollectErrors = (errors: any) => {
    const results = Object.entries(errors).reduce((all: any, curr: any) => {
        const [file, error] = curr
        all[file] = serializeError(error)
        return all
    }, {})
    return results
}
const main = async () => {
    const { config, tests } = workerData
    const { suites, errors } = await collect({ tests })
    const results = await runTestSuite({
        suite: suites,
        timeout: config.timeout,
    })

    parentPort?.postMessage({
        errors: serializeCollectErrors(errors),
        results: serializeResultErrors(results),
    })
}

parentPort!.on('message', (msg) => {
    if (msg === RUN) main()
})
