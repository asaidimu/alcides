import { EVENT_RUNNER_DONE } from './Symbols.js'
import TestCaseRunner from './TestCaseRunner.js'
import { createTestSuiteCollector, TestSuiteCollector } from './TestSuite.js'
import TestSuiteRunner, { TestSuiteResults } from './TestSuiteRunner.js'
import { assert } from 'chai'
import workerpool from 'workerpool'

type RunOptions = {
    runner: TestSuiteRunner
    paths: Array<string>
}

const run = async ({
    runner,
    paths,
}: RunOptions): Promise<Array<TestSuiteResults>> => {
    const { getTestSuites, suite, test, setUp, tearDown }: TestSuiteCollector =
        createTestSuiteCollector()

    Object.assign(global, { suite, test, setUp, tearDown, assert })
    for (const testFile of paths) {
        await import(testFile)
    }

    runner.add(getTestSuites())

    return new Promise((resolve) => {
        runner.on(EVENT_RUNNER_DONE, (results: Array<TestSuiteResults>) => {
            resolve(results)
        })
        runner.run()
    })
}

const work = async ({
    paths,
    config,
}: any): Promise<Array<TestSuiteResults>> => {
    const testCaseRunner: TestCaseRunner = new TestCaseRunner(
        config.testCaseRunnerConfig
    )
    const runner: TestSuiteRunner = new TestSuiteRunner(testCaseRunner)

    return await run({ paths, runner })
}

workerpool.worker({
    run: work,
})
