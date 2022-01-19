#!/usr/bin/env node

import report from './src/TestResultsReporter.js'
import { TestSuiteResults } from './src/TestSuiteResults.js'
import run from './src/TestRunner.js'
import createTestLoader from './src/TestLoader.js'
import path from 'path'
import { TestSuite } from './src/TestSuite.js'
import { readFile } from 'fs/promises'

interface Config {
    include: string[]
}

const readConfig = async (): Promise<Config> => {
    const p = path.format({
        dir: process.cwd(),
        base: 'package.json',
    })

    const json = await readFile(p, { encoding: 'utf8' })
    const config = JSON.parse(json).tests || {
        include: ['test', 'tests', 'dist/tests'],
    }
    return config
}

const main = async () => {
    const { include } = await readConfig()

    const paths = include.map((include_dir: string) =>
        path.format({
            dir: process.cwd(),
            base: include_dir,
        })
    )

    let suites: TestSuite[] = []

    const load = createTestLoader()

    for (const p of paths) {
        const loaded = await load(p)
        suites = suites.concat(loaded)
    }

    if (suites.length > 0) {
        const testSuiteResults: TestSuiteResults[] = await run(suites)
        report(testSuiteResults)
    } else {
        throw new Error('No suites were loaded!\n Check your configs.')
    }
}

main()
