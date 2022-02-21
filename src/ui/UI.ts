import { TestSuiteResults } from '../core/TestSuiteRunner.js'
import { TestRunnerResults } from '../core/TestRunner.js'
import { TestResult } from '../core/TestCaseRunner.js'
import { Config } from '../Config.js'
import EventEmitter from 'events'
import { RESULTS, STARTED } from '../core/Constants.js'
import { readFile } from 'fs/promises'
import chalk from 'chalk'
import ora from 'ora'
import { SourceMapConsumer } from 'source-map'
import path from 'path'

const formatErrorLocation = async (str: string) => {
    let result = ''
    const file = str.trim().substring(10).split(':')

    try {
        const data = JSON.parse(await readFile(`${file[0]}.map`, 'utf8'))
        data.sourceRoot = path.dirname(file[0])
        const consumer = await new SourceMapConsumer(data)
        const info = consumer.originalPositionFor({
            line: Number(file[1]),
            column: Number(file[2]),
        })

        result = `  ${chalk.bold.blue(info.source)}:${chalk.bold.blue(
            `${info.line}:${info.column}`
        )}`
        consumer.destroy()
    } catch {
        result = `  ${chalk.bold.blue(file[0])}:${chalk.bold.blue(
            `${file[1]}:${file[2]}`
        )}`
    }

    return result
}

export const logTime = (log: boolean = true) => {
    const time = chalk.grey(
        new Intl.DateTimeFormat('en-GB', { timeStyle: 'medium' }).format(
            new Date()
        )
    )

    if (log) {
        console.log(`  ${time}`)
    }
    return time
}

const getErrorLogger = (prefix: string) => {
    return async ([id, error]: any) => {
        const title = `    ${chalk.yellow(prefix)} @ ${chalk.bold.green(id)}`
        if (error.stack) {
            const stack = error.stack.split('\n')
            console.log(
                `${title}\n   ${chalk.grey(
                    await formatErrorLocation(stack[1])
                )}`
            )
            stack.forEach((string: string, index: number) => {
                let msg
                if (index === 0) {
                    msg = chalk.red(string)
                } else {
                    msg = chalk.grey(string)
                }
                console.error(`    ${msg}`)
            })
        } else {
            console.log(title)
        }
        console.log()
    }
}

const printErrors = async ({
    results,
    errors,
}: TestSuiteResults): Promise<void> => {
    const failed: any = results.reduce((all: any, curr: TestResult, _) => {
        if (curr.error !== null) all.push([curr.description, curr.error])
        return all
    }, [])

    const suiteErrorSymbols = Object.keys(errors)

    if (failed.length != 0 || suiteErrorSymbols.length != 0) {
        await Promise.allSettled(
            suiteErrorSymbols.map((key) =>
                getErrorLogger('SuiteError')([key, errors[key]])
            )
        )

        await Promise.allSettled(
            failed.map((err: [any]) => getErrorLogger('SuiteError')(err))
        )
    }
}

const getStatusLogger = ({
    passed = true,
    indentation,
}: {
    passed?: boolean
    indentation: string
}) => {
    return (value: any) => {
        const duration = chalk.grey(`(${Number(value.duration).toFixed(2)} ms)`)
        const status = passed ? chalk.green('') : chalk.red(``)
        const message = passed
            ? chalk.grey(value.description)
            : chalk.red(value.description)

        console.log(`${indentation}   ${status} ${message} ${duration}`)
    }
}

const printSuiteResults = ({
    results,
    description,
}: TestSuiteResults): void => {
    const indentation = new Array(2).fill(' ').join('')

    const { passed, failed }: any = results.reduce(
        (all: any, curr: any) => {
            if (curr.error === null) all.passed.push(curr)
            else all.failed.push(curr)
            return all
        },
        { passed: [], failed: [] }
    )

    if (passed.length > 0 || failed.length > 0) {
        console.log(`${indentation} ${chalk.bold(description)}`)

        passed.forEach(getStatusLogger({ indentation }))
        failed.forEach(getStatusLogger({ indentation, passed: false }))

        console.log()
    }
}

const printSummary = (suiteResults: Array<TestSuiteResults>) => {
    type Summary = {
        passed: number
        failed: number
        count: number
    }

    const reduceTestResults = (all: Summary, value: TestResult) => {
        all.count += 1
        if (value.error === null) all.passed += 1
        else all.failed += 1

        return all
    }

    const reduceSuiteResults = (all: Summary, value: TestSuiteResults) => {
        const { results } = value
        return results.reduce(reduceTestResults, all)
    }

    const { count, passed, failed }: Summary = suiteResults.reduce(
        reduceSuiteResults,
        <Summary>{ passed: 0, failed: 0, count: 0 }
    )

    logTime(true)
    if (count === 0) {
        console.error(chalk.red(`  0 tests ran`))
        return
    }

    if (passed > 0) console.log(chalk.green(`  ${passed} passed`))

    if (failed > 0) console.log(chalk.red(`  ${failed} failed`))
}

interface reportOpts extends TestRunnerResults {
    verbose: boolean
}

export const report = async ({ results, errors, verbose }: reportOpts) => {
    console.log()

    if (verbose) {
        results.forEach(printSuiteResults)
    }

    printSummary(results)
    console.log()
    await Promise.allSettled(results.map((result) => printErrors(result)))

    await Promise.allSettled(
        Object.entries(errors).map((error) =>
            getErrorLogger('TestCollector')(error)
        )
    )
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
        console.log('\n\n')
        report(Object.assign(results, { verbose: config.verbose }))
        await pause()
        spinner.start()
    })

    events.on(STARTED, async () => {
        spinner.stop()
        console.clear()
        console.log('\n')
        logTime()
        console.log('\n')
        await pause()
        spinner.start()
    })

    return events
}
