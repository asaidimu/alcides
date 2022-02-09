import { TestSuiteResults } from './TestSuiteRunner.js'
import TestLoader, {
    TestLoaderConfig,
    TestLoaderInterface,
} from './TestLoader.js'
import TestResultsReporter from './TestResultsReporter.js'
import path from 'path'
import { readFile } from 'fs/promises'

const readConfig = async (): Promise<TestLoaderConfig> => {
    const package_json = path.format({
        dir: process.cwd(),
        base: 'package.json',
    })
    const json = await readFile(package_json, { encoding: 'utf8' })

    const { include, workers, timeout } = JSON.parse(json).tests

    return { include, workers, testCaseRunnerConfig: { timeout } }
}

export default async () => {
    const config: TestLoaderConfig = await readConfig()
    const loader: TestLoaderInterface = new TestLoader(config)
    const results: Array<TestSuiteResults> = await loader.runParallell()
    const reporter = new TestResultsReporter()
    reporter.report(results)
}

export interface SuiteFunction {
    (description: string, cb: () => void): void
}
export interface SetUpHook {
    (cb: () => any): void
}
export interface TearDownHook {
    (cb: (state: any) => void): void
}
export interface TestFunction {
    (description: string, cb: (state: any) => void): void
}

declare global {
    var assert: Chai.AssertStatic
    var suite: SuiteFunction
    var test: TestFunction
    var setUp: SetUpHook
    var tearDown: TearDownHook
}
