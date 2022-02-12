import { parentPort, workerData } from 'worker_threads'
import { Config } from './Config.js'
import TestCaseRunner from './TestCaseRunner.js'
import { createTestSuiteCollector, TestSuiteCollector } from './TestSuite.js'
import run, { TestSuiteResults } from './TestSuiteRunner.js'
import { assert } from 'chai'

const exec = async (
    config: Config,
    paths: Array<string>
): Promise<Array<TestSuiteResults>> => {
    const { getTestSuites, suite, test, setUp, tearDown }: TestSuiteCollector =
        createTestSuiteCollector()

    Object.assign(global, { suite, test, setUp, tearDown, assert })

    for (const testFile of paths) {
        await import(testFile)
    }

    return run(new TestCaseRunner(config), getTestSuites())
}

const main = async () => {
    const { config, paths } = workerData
    const results = await exec(config, paths)

    parentPort?.postMessage(results)
}

main()
