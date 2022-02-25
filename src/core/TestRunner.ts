import path from 'path'
import { Worker } from 'worker_threads'
import { RUN, STARTED } from './Constants.js'
import { find, watch } from './File.js'
import { RESULTS } from './Constants.js'
import EventEmitter from 'events'

export const createTestRunnerOutput = (): TestRunnerOutput => ({
    results: {},
    errors: {
        test: [],
        hook: [],
        load: [],
    },
})

export const combineOutPut = (
    output: Array<TestRunnerOutput>
): TestRunnerOutput => {
    const combineObjectEntries = (
        all: TestRunnerOutput,
        [key, value]: [string, Array<any>]
    ) => {
        if (Array.isArray(all[key])) all[key] = all[key].concat(value)
        else all[key] = value
        return all
    }

    const reducer = (all: TestRunnerOutput, curr: TestRunnerOutput) => {
        return Object.entries(all).reduce((a, [key, value]: [string, any]) => {
            const entries: any = [value, curr[key]].map(Object.entries).flat()
            a[key] = entries.reduce(combineObjectEntries, {})
            return a
        }, <TestRunnerOutput>{})
    }

    return output.reduce(reducer)
}

const workerPath: string = ((): string => {
    const url = import.meta.url

    return path.format({
        base: 'Worker.js',
        dir: url.substring(7).slice(0, url.lastIndexOf('/') - 7),
    })
})()

const runWorker = async ({
    config,
    tests,
}: {
    config: Config
    tests: Array<string>
}): Promise<TestRunnerOutput> => {
    const worker = new Worker(workerPath, {
        workerData: { config, tests },
    })

    return new Promise((resolve) => {
        worker.on('error', (error) => {
            const result = createTestRunnerOutput()
            result.errors.load.push(error)
            resolve(result)
            worker.terminate()
        })

        worker.on('message', (results: TestRunnerOutput) => {
            resolve(results)
            worker.terminate()
        })
        worker.postMessage(RUN)
    })
}

type PathBuckets = Array<Array<string>>

const distributeTests = async ({
    paths,
    workers,
}: {
    paths: Array<string>
    workers: number
}): Promise<PathBuckets> => {
    const buckets = new Array(workers).fill(0).map((_) => [])

    const distribute = (all: PathBuckets, path: string, index: number) => {
        const bucket = index % workers
        all[bucket].push(path)
        return all
    }

    return paths.reduce(distribute, buckets)
}

export const runTests = async ({
    config,
}: {
    config: Config
}): Promise<TestRunnerOutput> => {
    const { workers, include, parallel } = config

    const paths = await find({ globs: include })

    const pathBuckets =
        workers > 0 && parallel
            ? await distributeTests({ paths, workers })
            : [paths]

    const results: Array<TestRunnerOutput> = await Promise.all(
        pathBuckets.map(async (paths: Array<string>) =>
            runWorker({ config, tests: paths })
        )
    )

    results.push(createTestRunnerOutput())
    const output = combineOutPut(results)

    output.hasErrors = Object.values(output.errors).flat().length > 0

    return output
}

export const runOnFileChange = async ({
    config,
    events,
}: {
    config: Config
    events: EventEmitter
}) => {
    const { files, include } = config
    const state: { running: boolean } = { running: false }

    const onChange = async () => {
        if (state.running) return

        events.emit(STARTED)
        state.running = true

        const results = await runWorker({
            config,
            tests: await find({ globs: include }),
        })

        events.emit(RESULTS, results)
        state.running = false
    }

    watch({ file: files, events, onChange })
    onChange() // should run at least once
}

export default runTests
