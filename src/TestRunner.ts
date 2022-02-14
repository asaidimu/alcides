import EventEmitter from 'events'
import glob from 'fast-glob'
import path from 'path'
import { Config } from './Config.js'
import { RESULTS, RUN } from './Constants.js'
import { TestSuiteResults } from './TestSuiteRunner.js'
import { Worker } from 'worker_threads'
import { exitWithInvalidConfigError } from './Errors.js'
import { watch } from 'fs'
import { logTime } from './TestResultsReporter.js'

export interface TestRunnerInterface {
    findTests: { (): Promise<Array<string>> }
    run: { (): Promise<Array<TestSuiteResults> | void> }
}

const formatPath = (name: string): string => {
    return path.format({
        base: name,
        dir: process.cwd(),
    })
}

export const findFiles = async (
    include: string | Array<string>
): Promise<Array<string>> => {
    const paths = await glob(include)
    return paths.map((name) => formatPath(name))
}

export class TestRunner extends EventEmitter implements TestRunnerInterface {
    private config: Config
    private running: boolean = false

    constructor(config: Config) {
        super()
        this.config = config
    }

    private async checkFiles() {
        const { files } = this.config
        if (files.length === 0) {
            exitWithInvalidConfigError(new Error('No files were specified.'))
        }
    }
    private workerPath(): string {
        const url = import.meta.url

        return path.format({
            base: 'WatchWorker.js',
            dir: url.substring(7).slice(0, url.lastIndexOf('/') - 7),
        })
    }

    private async createWorker(paths: Array<string>): Promise<Worker> {
        return new Worker(this.workerPath(), {
            workerData: {
                config: this.config,
                paths,
            },
        })
    }

    private async runWorker(
        paths: Array<string>
    ): Promise<Array<TestSuiteResults>> {
        const worker = await this.createWorker(paths)

        return new Promise((resolve) => {
            worker.on('message', (results: any) => {
                if (Array.isArray(results)) {
                    resolve(results)
                    worker.terminate()
                }
            })
            worker.postMessage(RUN)
        })
    }

    private async runInParallel(): Promise<Array<TestSuiteResults>> {
        const { workers } = this.config

        const tests = (await findFiles(this.config.include)).reduce(
            (all: Array<Array<string>>, path: string, index: number) => {
                all[index % workers].push(path)
                return all
            },
            new Array(workers).fill(0).map((_) => [])
        )

        const results = await Promise.all(
            tests.map((paths) => {
                return this.runWorker(paths)
            })
        )

        return results.reduce((all: any, curr: any) => all.concat(curr), [])
    }

    private async runOnFileChange() {
        if (this.running) {
            return
        }

        this.running = true

        const worker = await this.createWorker(
            await findFiles(this.config.include)
        )

        worker.on('message', (results: any) => {
            if (Array.isArray(results)) {
                this.emit(RESULTS, results)
                this.running = false
            }
        })

        worker.postMessage(RUN)
    }

    private async startWatcher() {
        this.checkFiles()
        this.config.files.forEach((file) => {
            try {
                watch(file, this.runOnFileChange.bind(this))
            } catch (e) {
                exitWithInvalidConfigError(e)
            }
        })

        this.runOnFileChange()
    }

    async run(): Promise<Array<TestSuiteResults> | void> {
        if (this.config.parallel) {
            return this.runInParallel()
        } else if (this.config.watch) {
            return this.startWatcher()
        } else {
            return this.runWorker(await findFiles(this.config.include))
        }
    }

    async findTests() {
        return findFiles(this.config.include)
    }
}
