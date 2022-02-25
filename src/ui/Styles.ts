import chalk from 'chalk'
import { SourcePosition } from '../core/Utils'
const { bold } = chalk

export const styleErrorPosition = ({
    source,
    line,
    column,
}: SourcePosition): string =>
    `@ ${bold.blue(source)}:${bold.blue(`${line}:${column}`)}`

export const styleTime = ({ indentation, time }: any): string =>
    `${indentation}${chalk.grey(time)}`

export const styleErrorStack = ({ indentation, stack }: any): string => {
    return stack
        .split('\n')
        .map((line: string, i: number) => {
            let style = i === 0 ? chalk.red(line) : chalk.grey(line)
            return `${indentation}${style}`
        })
        .join('\n')
}

export const styleError = ({ indentation, id, error }: any): string => {
    id.length > 0 ? (id = `${chalk.bold.green(id)}`) : ''
    let result = `${indentation}${id}`
    if (error.stack) {
        result += `\n${indentation}${styleErrorPosition(error.position)}`
        result += `\n${styleErrorStack({ indentation, stack: error.stack })}`
    }
    return result
}

export const styleTestStatus = ({
    passed,
    indentation,
    duration,
    description,
}: any): string => {
    const status = passed ? chalk.green('') : chalk.red(``)
    const message = passed ? chalk.grey(description) : chalk.red(description)
    const styledDur = chalk.grey(`(${Number(duration).toFixed(2)})`)

    return `${indentation}${status} ${message} ${styledDur}`
}

export const styleDescription = ({ indentation, description }: any): string =>
    `${indentation}${chalk.bold(description)}`

export const styleSummary = ({ indentation, passed, failed }: any): string => {
    const count = passed + failed

    if (count === 0) {
        return chalk.red(`${indentation}0 tests ran\n`)
    }

    let result = []
    if (passed > 0) result.push(chalk.green(`${indentation}${passed} passed`))
    else result.push(' ')

    if (failed > 0) result.push(chalk.red(`${indentation}${failed} failed`))
    else result.push(' ')

    return result.join('\n')
}
