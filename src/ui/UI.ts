import { Config } from '../config/Config.js'
import EventEmitter from 'events'
import { RESULTS, STARTED } from '../core/Constants.js'
import ora from 'ora'
import {
    styleDescription,
    styleError,
    styleSummary,
    styleTestStatus,
    styleTime,
} from './Styles.js'
import chalk from 'chalk'
import { getTime } from './Utils.js'
import { GenericError, TestResult } from '../core/TestCaseRunner.js'
import {
    TestRunnerOutput,
    TestRunnerOutputErrors,
    TestRunnerOutputResults,
} from '../core/TestRunner.js'

function getSummary({ results }: { results: TestRunnerOutputResults }): string {
    interface Params {
        indentation: string
        passed: number
        failed: number
    }

    const params: Params = Object.values(results)
        .flat()
        .reduce(
            (all: Params, curr: TestResult) => {
                curr.passed ? all.passed++ : all.failed++
                return all
            },
            { indentation: '  ', passed: 0, failed: 0 }
        )

    return styleSummary(params)
}

const getRunTimeErrors = ({
    errors,
}: {
    errors: TestRunnerOutputErrors
}): string =>
    Object.values(errors)
        .flat()
        .map((error: GenericError) =>
            styleError({
                indentation: '  ',
                id: error.id || 'RuntimeError',
                error,
            })
        )
        .join('\n')

const getStatus = ({ results }: { results: TestRunnerOutputResults }): string =>
    Object.entries(results)
        .reduce(
            (
                all: Array<string>,
                [id, testResults]: [string, Array<TestResult>]
            ) => {
                let result = [
                    styleDescription({
                        indentation: '  ',
                        description: id,
                    }),
                ]

                result = result.concat(
                    testResults
                        .sort((r) => (r.passed ? -1 : 0))
                        .map((r: TestResult) =>
                            styleTestStatus({
                                indentation: '    ',
                                passed: r.passed,
                                duration: r.duration,
                                description: r.id,
                            })
                        )
                )

                all.push(result.join('\n'))
                return all
            },
            <Array<string>>[]
        )
        .join('\n\n')

export const report = async ({
    results,
    errors,
    verbose,
}: TestRunnerOutput & { verbose: boolean }) => {
    const summary = getSummary({ results })
    const runTimeErrors = getRunTimeErrors({ errors })
    const status = getStatus({ results })

    console.clear()
    console.log()

    if (verbose) {
        console.log(status, '\n')
    }

    if (runTimeErrors.length > 0) {
        console.log(runTimeErrors, '\n')
    }

    console.log()
    console.log(styleTime({ time: getTime(), indentation: '  ' }))
    console.log(summary)
}

const showSpinner = ({ events }: { events: EventEmitter }) => {
    const pause = () => new Promise((resolve) => setTimeout(resolve, 50))

    const spinner = ora('').start()
    spinner.prefixText = ' '
    spinner.spinner = 'point'
    spinner.start()

    events.on('pauseSpinner', () => {
        spinner.stop()
    })

    events.on('resumeSpinner', async () => {
        await pause()
        spinner.start()
    })
}

const waitForResults = () => {
    console.clear()
    console.log('\n')
    console.log(styleTime({ time: getTime(), indentation: '  ' }))
    console.log(chalk.grey('  Running...\n'))
}

export const startUI = ({ config }: { config: Config }): EventEmitter => {
    const events = new EventEmitter()
    showSpinner({ events })

    events.on(STARTED, async () => {
        events.emit('pauseSpinner')
        waitForResults()
        events.emit('resumeSpinner')
    })

    events.on(RESULTS, async (results: TestRunnerOutput) => {
        events.emit('pauseSpinner')
        report(Object.assign(results, { verbose: config.verbose }))
        events.emit('resumeSpinner')
    })

    return events
}
