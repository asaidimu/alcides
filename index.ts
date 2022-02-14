#!/usr/bin/env node

import TestResultsReporter from './src/TestResultsReporter.js'
import { TestRunner } from './src/TestRunner.js'
import { RESULTS } from './src/Constants.js'

const main = async () => {
    const reporter = new TestResultsReporter()
    const config = (await import('./src/Config.js')).default

    reporter.setConfig(config)

    const runner = new TestRunner(config)

    if (config.watch && !config.parallel) {
        runner.on(RESULTS, reporter.report.bind(reporter))
        runner.run()
        return
    } else {
        const results = await runner.run()
        await reporter.report(results!)
    }
}

main()
