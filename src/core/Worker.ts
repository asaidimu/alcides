import { parentPort, workerData } from 'worker_threads'
import runTestSuite from './TestSuiteRunner.js'
import { RUN } from './Constants.js'
import { collect } from './TestCollector.js'
import { aggregateOutPut } from './Results.js'

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
