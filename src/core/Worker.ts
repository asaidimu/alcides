import { parentPort, workerData } from 'worker_threads'
import runTestSuite, { TestSuiteResults } from './TestSuiteRunner.js'
import { RUN } from './Constants.js'
import { collect } from './TestCollector.js'
import { TestError } from './TestCaseRunner.js'
import { createTestRunnerOutput, TestRunnerOutput } from './TestRunner.js'
import { setPosition } from './Utils.js'

export const copyError = (error: TestError): TestError =>
    <TestError>(
        Object.fromEntries(
            Object.entries(Object.getOwnPropertyDescriptors(error)).map(
                ([key, value]) => [key, value.value]
            )
        )
    )

export const serializeOutPutErrors = ({
    output,
}: {
    output: TestRunnerOutput
}): TestRunnerOutput => {
    const errors = Object.entries(output.errors).map(
        ([key, value]: [string, Array<TestError>]) => {
            return [key, value.map(copyError)]
        }
    )

    output.errors = Object.fromEntries(errors)
    return output
}

export const positionErrors = async (input: {
    [key: string]: Array<TestError>
}): Promise<any> => {
    const errors = await Promise.all(
        Object.entries(input).map(
            async ([key, value]: [string, Array<TestError>]) => {
                return [key, await Promise.all(value.map(setPosition))]
            }
        )
    )
    return Object.fromEntries(errors)
}

const aggregateOutPut = async ({
    results,
    errors,
}: {
    results: Array<TestSuiteResults>
    errors: Array<TestError>
}): Promise<TestRunnerOutput> => {
    let output: TestRunnerOutput = createTestRunnerOutput()
    output.errors.load = errors

    output = results.reduce((all: TestRunnerOutput, curr: TestSuiteResults) => {
        all.results[curr.id] = curr.results

        Object.entries(curr.errors).forEach(
            ([key, value]: [string, Array<TestError>]) => {
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

    return serializeOutPutErrors({ output })
}
const main = async () => {
    const { config, tests } = workerData
    const { suites, errors } = await collect({ tests })

    const results: Array<TestSuiteResults> = await runTestSuite({
        suite: suites,
        timeout: config.timeout,
    })

    parentPort?.postMessage(await aggregateOutPut({ errors, results }))
}

parentPort!.on('message', (msg) => {
    if (msg === RUN) main()
})
