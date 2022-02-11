#!/usr/bin/env node

import TestResultsReporter from './src/TestResultsReporter.js'
import { TestRunner } from './src/TestRunner.js'
import { Config, readConfig } from './src/Config.js'

const main = async () => {
    const config: Config = await readConfig()
    const runner = new TestRunner(config)
    const reporter = new TestResultsReporter()
    await reporter.report(await runner.run())
}

main()
