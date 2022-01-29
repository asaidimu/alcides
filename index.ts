#!/usr/bin/env node

import { TestSuiteResults } from './src/TestSuiteRunner.js'
import TestLoader, {
    TestLoaderConfig,
    TestLoaderInterface,
} from './src/TestLoader.js'
import TestResultsReporter from './src/TestResultsReporter.js'
import path from 'path'
import { readFile } from 'fs/promises'

declare global {
    var assert: Chai.AssertStatic
    var suite: Function
    var test: Function
    var setUp: Function
    var tearDown: Function
}

export const readConfig = async (): Promise<TestLoaderConfig> => {
    const package_json = path.format({
        dir: process.cwd(),
        base: 'package.json',
    })
    const json = await readFile(package_json, { encoding: 'utf8' })

    const { include, workers, timeout } = JSON.parse(json).tests

    return { include, workers, testCaseRunnerConfig: { timeout } }
}

const main = async () => {
    const config: TestLoaderConfig = await readConfig()
    const loader: TestLoaderInterface = new TestLoader(config)
    const results: Array<TestSuiteResults> = await loader.runParallell()
    const reporter = new TestResultsReporter()
    reporter.report(results)
}

main()
