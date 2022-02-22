import path from 'path'
import { Config } from '../Config.js'
import { TestSuiteResults } from './TestSuiteRunner.js'
import { Worker } from 'worker_threads'
import { RUN, STARTED } from './Constants.js'
import { find, watch } from './File.js'
import { RESULTS } from './Constants.js'
import EventEmitter from 'events'

export interface TestRunnerResults {
    errors: { [key: string | number]: Error }
    results: Array<TestSuiteResults>
}

const workerPath: string = ((): string => {
    const url = import.meta.url

    return path.format({
        base: 'Worker.js',
        dir: url.substring(7).slice(0, url.lastIndexOf('/') - 7),
    })
})()

interface createWOpts {
    config: Config
    tests: Array<string>
}
type createWResult = Promise<Worker>

const createWorker = async ({ config, tests }: createWOpts): createWResult => {
    return new Worker(workerPath, {
        workerData: { config, tests },
    })
}

interface runWOpts {
    worker: Worker
}
type runWResult = Promise<TestRunnerResults>
const runWorker = async ({ worker }: runWOpts): runWResult => {
    return new Promise((resolve) => {
        worker.on('error', (error) => {
            resolve({ errors: { [error.message]: error }, results: [] })
            worker.terminate()
        })
        worker.on('message', (results: any) => {
            resolve(results)
            worker.terminate()
        })
        worker.postMessage(RUN)
    })
}

interface runPOpts {
    config: Config
}
type runPResults = Promise<TestRunnerResults>

const runInParallel = async ({ config }: runPOpts): runPResults => {
    const { workers, include } = config

    const tests = (await find({ globs: include })).reduce(
        (all: Array<Array<string>>, path: string, index: number) => {
            all[index % workers].push(path)
            return all
        },
        new Array(workers).fill(0).map((_) => [])
    )

    const results = await Promise.all(
        tests.map(async (paths) => {
            const worker = await createWorker({ config, tests: paths })
            return runWorker({ worker })
        })
    )

    return results.reduce(
        (all: any, curr: any) => {
            all.errors = Object.assign(all.errors, curr.errors)
            all.results = all.results.concat(curr.results)
            return all
        },
        {
            errors: {},
            results: [],
        }
    )
}

interface runFOpts {
    config: Config
    events: EventEmitter
}

const runOnFileChange = async ({ config, events }: runFOpts) => {
    const { files, include } = config
    const state: { running: boolean } = { running: false }

    const onChange = async () => {
        if (state.running) {
            return
        }
        events.emit(STARTED)
        state.running = true

        const tests = await find({ globs: include })
        const worker = await createWorker({ config, tests })

        worker.on('error', (error) => {
            events.emit(RESULTS, {
                errors: { [error.message]: error },
                results: [],
            })
            state.running = false
        })

        worker.on('message', (results: any) => {
            events.emit(RESULTS, results)
            state.running = false
        })

        worker.postMessage(RUN)
    }

    watch({ file: files, events, onChange })
    onChange()
}

export const hasErrors = ({ errors, results }: TestRunnerResults): boolean => {
    if (Object.values(errors).length > 0) {
        return true
    }

    for (const result of results) {
        if (Object.values(result.errors).length > 0) {
            return true
        }

        for (const r of result.results) {
            if (r.error !== null) {
                return true
            }
        }
    }

    return false
}

interface runOpts {
    config: Config
    events?: EventEmitter
}
type runResults = Promise<TestRunnerResults | undefined>

const runTests = async ({ config, events }: runOpts): runResults => {
    if (config.parallel) {
        return runInParallel({ config })
    } else if (config.watch) {
        runOnFileChange({ config, events: events! })
    } else {
        const tests = await find({ globs: config.include })
        const worker = await createWorker({ config, tests })
        return runWorker({ worker })
    }
}

export default runTests
