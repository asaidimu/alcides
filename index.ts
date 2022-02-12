#!/usr/bin/env node

import TestResultsReporter from './src/TestResultsReporter.js'
import { TestRunner } from './src/TestRunner.js'
import { Config, readConfig } from './src/Config.js'
import { RESULTS } from './src/Constants.js'

const main = async () => {
    const config: Config = await readConfig()
    const runner = new TestRunner(config)
    const reporter = new TestResultsReporter()

    if (config.watch) {
        runner.on(RESULTS, reporter.report)
        runner.run()
    } else {
        const results = await runner.run()
        await reporter.report(results!)
    }
}

main()
