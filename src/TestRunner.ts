import { opendir } from 'fs/promises'
import { exitWithInvalidConfigError } from './Errors.js'
import path from 'path'
import { Config } from './Config.js'
import {
    SuiteFunction,
    TestFunctionHook,
    SetUpHook,
    TearDownHook,
    createTestSuiteCollector,
    TestSuiteCollector,
} from './TestSuite.js'
import run, { TestSuiteResults } from './TestSuiteRunner.js'
import TestCaseRunner, { TestCaseRunnerInterface } from './TestCaseRunner.js'
import { assert } from 'chai'

declare global {
    var assert: Chai.AssertStatic
    var suite: SuiteFunction
    var test: TestFunctionHook
    var setUp: SetUpHook
    var tearDown: TearDownHook
}

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
    run: { (): Promise<Array<TestSuiteResults>> }
}

export class TestRunner {
    private config: Config
    private runner: TestCaseRunnerInterface

    constructor(config: Config) {
        this.config = config
        this.runner = new TestCaseRunner(config)
    }

    async run(): Promise<Array<TestSuiteResults>> {
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

    async findTests() {
        return findTests(this.config)
    }
}
