import { TestSuiteResults } from './TestResults.js'
import chalk from 'chalk'

const createStatusPrinter = ({ level = 1 }: any) => {
    const indentation = new Array(level * 2).fill(' ').join('')

    return ({ id, results, suites }: TestSuiteResults) => {
        const failedTests = Object.entries(results.failedTests)
        if (failedTests.length > 0 || results.passedTests.length > 0) {
            console.log(`${indentation} ${chalk.bold(id)}`)

            results.passedTests.forEach((id: string) => {
                console.log(
                    `${indentation}   ${chalk.green('')} ${chalk.grey(id)}`
                )
            })

            Object.entries(results.failedTests).forEach(([id, _]) => {
                console.log(
                    `${indentation}   ${chalk.red(``)} ${chalk.red(id)}`
                )
            })

            if (suites.length != 0) {
                console.log()
                suites.forEach(createStatusPrinter({ level: level + 1 }))
            }
        }
    }
}

const printSummary = (results: TestSuiteResults[]) => {
    const { passed, failed } = results.reduce(
        (acc: any, curr: TestSuiteResults) => {
            acc.passed += curr.passed
            acc.failed += curr.failed
            return acc
        },
        { passed: 0, failed: 0 }
    )

    if (passed > 0) console.log(chalk.green(`  ${passed} passed`))
    if (failed > 0) console.log(chalk.red(`  ${failed} failed`))
}

const createErrorPrinter = () => {
    return ({ id, results, suites }: TestSuiteResults) => {
        const { failedTests, errors } = results
        const testErrors = Object.entries(failedTests)
        const suiteErrors = Object.entries(errors)

        if (testErrors.length != 0 || suiteErrors.length != 0) {
            console.log(`\n TestSuite: ${id}\n`)
        }

        const formatErrorLocation = (str: string) => {
            let result = ''
            if (str.match(process.cwd())) {
                const info = str
                    .trim()
                    .substring(10)
                    .substring(process.cwd().length + 1)
                    .split(':')
                result = `@ ${chalk.bold.blue(
                    './' + info[0]
                )} : ${chalk.bold.blue(info[1])}`
            }
            return result
        }
        const getLogger = (prefix: string) => {
            return ([id, error]: [string, Error]) => {
                const title = `    ${chalk.bold.green(id)}. ${chalk.yellow(
                    prefix
                )}`

                if (error.stack) {
                    const stack = error.stack.split('\n')

                    console.log(
                        `${title} ${chalk.grey(formatErrorLocation(stack[1]))}`
                    )
                    stack.forEach((string, index) => {
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
            }
        }

        suiteErrors.forEach(getLogger('SuiteError'))
        testErrors.forEach(getLogger('TestCaseError'))

        if (suites.length != 0) {
            suites.forEach(createErrorPrinter())
        }
    }
}

export default (results: TestSuiteResults[]) => {
    console.log()
    results.forEach(createStatusPrinter({ level: 1 }))
    console.log()
    printSummary(results)
    console.log()
    results.forEach(createErrorPrinter())
}
