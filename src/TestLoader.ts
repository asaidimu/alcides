import { opendir } from 'fs/promises'
import path from 'path'
import { createTestSuiteCollector, TestSuiteCollector } from './TestSuite.js'
import TestSuiteRunner, { TestSuiteResults } from './TestSuiteRunner.js'
import TestCaseRunner, { TestCaseRunnerConfig } from './TestCaseRunner.js'
import { EVENT_RUNNER_DONE } from './Symbols.js'
import { assert } from 'chai'
import workerpool from 'workerpool'
import { exitWithInvalidConfigError } from './Errors.js'

export interface TestLoaderInterface {
    findTests: Function
    run: Function
    runParallell: Function
}

export type TestLoaderConfig = {
    include: string | Array<string>
    workers: number
    testCaseRunnerConfig?: TestCaseRunnerConfig
}
const defaultConfig = {
    include: 'tests',
    workers: 3,
}

const formatPath = (name: string, location: string): string => {
    return path.format({
        base: name,
        dir: path.format({
            base: location,
            dir: process.cwd(),
        }),
    })
}

export default class TestLoader implements TestLoaderInterface {
    private include: string | Array<string>
    private runner: TestSuiteRunner
    private config: TestLoaderConfig

    constructor(config: TestLoaderConfig = defaultConfig) {
        this.config = config
        this.runner = new TestSuiteRunner(new TestCaseRunner())
        this.include = config.include
    }

    private async getEntries(location: string) {
        try {
            const entries = await opendir(location)
            return entries
        } catch (error: any) {
            exitWithInvalidConfigError(error)
        }
    }

    async findTests(): Promise<Array<string>> {
        const include = Array.isArray(this.include)
            ? this.include
            : [this.include]

        const testFiles: Array<string> = []

        for (const location of include) {
            const entries = await this.getEntries(location)

            for await (const { name } of entries!) {
                if (name.match(/.*.js$/)) {
                    testFiles.push(formatPath(name, location))
                }
            }
        }

        return testFiles
    }

    async run(file?: string): Promise<Array<TestSuiteResults>> {
        const paths = file ? [file] : await this.findTests()

        const {
            getTestSuites,
            suite,
            test,
            setUp,
            tearDown,
        }: TestSuiteCollector = createTestSuiteCollector()
        Object.assign(global, { suite, test, setUp, tearDown, assert })

        for (const testFile of paths) {
            await import(testFile)
        }

        this.runner.add(getTestSuites())

        return new Promise((resolve) => {
            this.runner.on(EVENT_RUNNER_DONE, resolve)
            this.runner.run()
        })
    }

    async runParallell(): Promise<Array<TestSuiteResults>> {
        const paths = await this.findTests()
        const url = import.meta.url
        const workers = this.config.workers || 3

        const workerPath = path.format({
            base: 'Worker.js',
            dir: url.substring(7).slice(0, url.lastIndexOf('/') - 7),
        })

        const pool = workerpool.pool(workerPath, {
            minWorkers: workers,
            workerType: 'thread',
        })

        let bucket: any = new Array(workers).fill(0).map(() => [])

        bucket = paths.reduce((acc, curr, i) => {
            acc[i % workers].push(curr)
            return acc
        }, bucket)

        let results = await Promise.all(
            bucket.reduce((acc: any, curr: any) => {
                acc.push(
                    pool.exec('run', [{ paths: curr, config: this.config }])
                )
                return acc
            }, [])
        )

        pool.terminate()

        results = results.reduce((acc: any, curr: any) => acc.concat(curr), [])

        return results
    }
}
