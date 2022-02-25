import { parentPort, workerData } from 'worker_threads'
import runTestSuite, { TestSuiteResults } from './TestSuiteRunner.js'
import { RUN } from './Constants.js'
import { collect } from './TestCollector.js'
import { GenericError } from './TestCaseRunner.js'
import { createTestRunnerOutput, TestRunnerOutput } from './TestRunner.js'
import { setPosition } from './Utils.js'

const copyError = (error: GenericError): GenericError => {
    return {
        message: error.message,
        name: error.name,
        stack: error.stack,
        id: error.id,
        code: error.code,
        position: error.position,
    }
}

const serializeOutPutErrors = (output: TestRunnerOutput): TestRunnerOutput => {
    const errors = Object.entries(output.errors).map(
        ([key, value]: [string, Array<GenericError>]) => {
            return [key, value.map(copyError)]
        }
    )

    output.errors = Object.fromEntries(errors)
    return output
}

const positionErrors = async (input: {
    [key: string]: Array<GenericError>
}): Promise<any> => {
    const errors = await Promise.all(
        Object.entries(input).map(
            async ([key, value]: [string, Array<GenericError>]) => {
                return [key, await Promise.all(value.map(setPosition))]
            }
        )
    )
    return Object.fromEntries(errors)
}

const prepareOutPut = async ({
    results,
    errors,
}: {
    results: Array<TestSuiteResults>
    errors: Array<GenericError>
}): Promise<TestRunnerOutput> => {
    let output: TestRunnerOutput = createTestRunnerOutput()
    output.errors.load = errors

    output = results.reduce((all: TestRunnerOutput, curr: TestSuiteResults) => {
        all.results[curr.id] = curr.results

        Object.entries(curr.errors).forEach(
            ([key, value]: [string, Array<GenericError>]) => {
                if (Array.isArray(all.errors[key])) {
                    all.errors[key] = all.errors[key].concat(value)
                } else {
                    all.errors[key] = value
                }
            }
        )

        return all
    }, output)

    output.errors = await positionErrors(output.errors)

    return serializeOutPutErrors(output)
}
const main = async () => {
    const { config, tests } = workerData
    const { suites, errors } = await collect({ tests })

    const results: Array<TestSuiteResults> = await runTestSuite({
        suite: suites,
        timeout: config.timeout,
    })

    parentPort?.postMessage(await prepareOutPut({ errors, results }))
}

parentPort!.on('message', (msg) => {
    if (msg === RUN) main()
})
