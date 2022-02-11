import { TestSuiteResults } from './TestSuiteRunner.js'
import chalk from 'chalk'
import { getSymbolName } from './Symbols.js'
import { TestResult } from './TestCaseRunner.js'

// const formatErrorLocation = (str: string) => {
//    let result = '';
//    if (str.match(process.cwd())) {
//        const info = str
//        .trim()
//        .substring(10)
//        .substring(process.cwd().length + 1)
//        .split(':');
//        result = `@ ${chalk.bold.blue('./' + info[0])} : ${chalk.bold.blue(info[1])}`;
//    }
//    return result;
//};

const getLogger = (prefix: string) => {
    return ([id, error]: any) => {
        const title = `    ${chalk.bold.green(id)}. ${chalk.yellow(prefix)}`
        if (error.stack) {
            const stack = error.stack.split('\n')
            console.log(`${title}`) // ${chalk.grey(formatErrorLocation(stack[1]))}`);
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

const printErrors = ({
    results,
    description,
    errors,
}: TestSuiteResults): void => {
    const failed: any = results.reduce((all: any, curr: TestResult, _) => {
        if (curr.error !== null) all.push([curr.description, curr.error])
        return all
    }, [])

    const suiteErrorSymbols = Object.keys(errors)

    if (failed.length != 0 || suiteErrorSymbols.length != 0) {
        console.log(
            `\n ${chalk.yellow('TestSuite')}: ${chalk.bold(description)}\n`
        )

        suiteErrorSymbols.forEach((key) => {
            getLogger('SuiteError')([getSymbolName(key), errors[key]])
        })

        failed.forEach(getLogger('TestCaseError'))
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

    const getLogger = (passed: boolean = true) => {
        return (value: any) => {
            const duration = chalk.grey(
                `(${Number(value.duration).toFixed(2)} ms)`
            )
            const status = passed ? chalk.green('') : chalk.red(``)
            const message = passed
                ? chalk.grey(value.description)
                : chalk.red(value.description)

            console.log(`${indentation}   ${status} ${message} ${duration}`)
        }
    }

    if (passed.length > 0 || failed.length > 0) {
        console.log(`${indentation} ${chalk.bold(description)}`)

        passed.forEach(getLogger())
        failed.forEach(getLogger(false))

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

    if (count === 0) {
        console.error(chalk.red(`  0 tests ran`))
        return
    }

    if (passed > 0) console.log(chalk.green(`  ${passed} passed`))

    if (failed > 0) console.log(chalk.red(`  ${failed} failed`))
}

export class TestResultsReporter {
    async report(results: Array<TestSuiteResults>): Promise<void> {
        console.log()
        results.forEach(printSuiteResults)
        console.log()
        printSummary(results)
        console.log()
        results.forEach(printErrors)
    }
}

export default TestResultsReporter
