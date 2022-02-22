import { TestRunnerResults } from '../core/TestRunner.js'
import { Config } from '../Config.js'
import EventEmitter from 'events'
import { RESULTS, STARTED } from '../core/Constants.js'
import ora from 'ora'
import {
    getOriginalPosition,
    getTime,
    reduceTestSuiteResults,
} from './Utils.js'
import {
    styleDescription,
    styleError,
    styleSummary,
    styleTestStatus,
    styleTime,
} from './Styles.js'
import { CodedError } from '../core/TestCaseRunner.js'
import chalk from 'chalk'

interface reportOpts extends TestRunnerResults {
    verbose: boolean
}

export const report = async ({ results, errors, verbose }: reportOpts) => {
    const reduced = await reduceTestSuiteResults({ results })
    const runTimeErrors = await Promise.all(
        Object.entries(errors).map(async ([k, error]) => {
            let err: CodedError = error
            err.position = await getOriginalPosition(
                error.stack!.split('\n')[1]
            )
            return [k, error]
        })
    )

    const summary = styleSummary(
        reduced.reduce(
            (all, curr) => {
                all.passed += curr.passed.length
                all.failed += curr.failed.length
                return all
            },
            { indentation: '  ', passed: 0, failed: 0 }
        )
    )

    const testStatus = reduced
        .reduce((all, curr) => {
            let result = [
                styleDescription({
                    indentation: '  ',
                    description: curr.description,
                }),
            ]

            result = result.concat(
                curr.passed.concat(curr.failed).map((i) =>
                    styleTestStatus({
                        indentation: '    ',
                        passed: i.error === null,
                        duration: i.duration,
                        description: i.description,
                    })
                )
            )

            all.push(result.join('\n'))
            return all
        }, <Array<string>>[])
        .join('\n\n')

    const testErrors = reduced
        .reduce((all, curr) => {
            if (curr.failed.length === 0 && curr.errors.length === 0) return all

            let result = [
                styleDescription({
                    indentation: ' ',
                    description: curr.description,
                }),
            ]

            result = result.concat(
                curr.failed.map((i) => {
                    return styleError({
                        indentation: '  ',
                        prefix: 'TestError',
                        id: i.description,
                        error: i.error,
                    })
                })
            )

            result = result.concat(
                curr.errors.map((i) => {
                    return styleError({
                        indentation: '  ',
                        prefix: 'TestError',
                        id: i[0],
                        error: i[1],
                    })
                })
            )

            all.push(result.join('\n'))
            return all
        }, <Array<string>>[])
        .join('\n')

    const runErrors = runTimeErrors
        .map((i) => {
            return styleError({
                indentation: '  ',
                prefix: 'RuntimeError',
                id: '',
                error: i[1],
            })
        })
        .join('\n')

    console.log()
    if (verbose) {
        console.log(testStatus, '\n')
    }

    if (testErrors.length > 0) {
        console.log(testErrors, '\n')
    }

    if (runErrors.length > 0) {
        console.log(runErrors, '\n')
    }

    console.log()
    console.log(styleTime({ time: getTime(), indentation: '  ' }))
    console.log(summary)
}

export const startUI = ({ config }: { config: Config }): EventEmitter => {
    const events = new EventEmitter()
    const pause = () => new Promise((resolve) => setTimeout(resolve, 50))

    const spinner = ora('').start()
    spinner.prefixText = ' '
    spinner.spinner = 'point'

    spinner.start()
    events.on(RESULTS, async (results: TestRunnerResults) => {
        spinner.stop()
        console.clear()
        report(Object.assign(results, { verbose: config.verbose }))
        await pause()
        spinner.start()
    })

    events.on(STARTED, async () => {
        spinner.stop()
        console.clear()
        console.log('\n')
        console.log(styleTime({ time: getTime(), indentation: '  ' }))
        console.log(chalk.grey('  Running...\n'))
        await pause()
        spinner.start()
    })

    return events
}
