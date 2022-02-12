import { opendir } from 'fs/promises'
import { exitWithInvalidConfigError } from './Errors.js'
import path from 'path'
import { Config } from './Config.js'
import { createTestSuiteCollector, TestSuiteCollector } from './TestSuite.js'

import run, { TestSuiteResults } from './TestSuiteRunner.js'
import TestCaseRunner, { TestCaseRunnerInterface } from './TestCaseRunner.js'
import { assert } from 'chai'
import EventEmitter from 'events'
import { watch } from 'fs'
import { RESULTS } from './Constants.js'
import { Worker } from 'worker_threads'

const getEntries = async (location: string) => {
    try {
        const entries = await opendir(location)
        return entries
    } catch (error: any) {
        exitWithInvalidConfigError(error)
    }
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

export const findTests = async (config: {
    include: Readonly<string> | ReadonlyArray<string>
}): Promise<Array<string>> => {
    const { include } = config
    const locations = Array.isArray(include) ? include : [include]

    const testFiles: Array<string> = []

    for (const location of locations) {
        const entries = await getEntries(location)

        for await (const { name } of entries!) {
            if (name.match(/.*.js$/)) {
                testFiles.push(formatPath(name, location))
            }
        }
    }

    return testFiles
}

export interface TestRunnerInterface {
    findTests: { (): Promise<Array<string>> }
    run: { (): Promise<Array<TestSuiteResults> | void> }
}

export class TestRunner extends EventEmitter implements TestRunnerInterface {
    private config: Config
    private runner: TestCaseRunnerInterface

    constructor(config: Config) {
        super()
        this.config = config
        this.runner = new TestCaseRunner(config)
    }

    private async runOnce(): Promise<Array<TestSuiteResults>> {
        const paths = await this.findTests()

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

        return run(this.runner, getTestSuites())
    }

    private async checkFiles() {
        const { files } = this.config
        if (files.length === 0) {
            exitWithInvalidConfigError(new Error('No files were specified.'))
        }
    }

    private async runWatcher() {
        const { files } = this.config

        const state: { running: boolean } = { running: false }

        let url = import.meta.url
        url = url.substring(7).slice(0, url.lastIndexOf('/') - 7)

        const worker_url = path.format({
            base: 'WatchWorker.js',
            dir: url,
        })

        const onFileChange = async () => {
            if (state.running) {
                return
            }

            const paths = await this.findTests()

            const worker = new Worker(worker_url, {
                workerData: {
                    config: this.config,
                    paths,
                },
            })

            worker.on('message', (results: any) => {
                this.emit(RESULTS, results)
                state.running = false
            })
        }

        files.forEach((file) => {
            watch(file, onFileChange)
        })

        onFileChange()
    }

    async run(): Promise<Array<TestSuiteResults> | void> {
        if (this.config.watch) {
            this.checkFiles()
            this.runWatcher()
            return
        }

        return this.runOnce()
    }

    async findTests() {
        return findTests(this.config)
    }
}
