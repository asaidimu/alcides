import { SourceMapConsumer } from 'source-map'
import { readFile } from 'fs/promises'
import path from 'path'
import { TestSuiteResults } from '../core/TestSuiteRunner.js'
import { TestResult, CodedError } from '../core/TestCaseRunner.js'

export interface ErrorPosition {
    source: string
    column: number
    line: number
}

export const getOriginalPosition = async (
    str: string
): Promise<ErrorPosition> => {
    const keyMap: { [key: number]: string } = {
        0: 'source',
        1: 'line',
        2: 'column',
    }

    let result = str
        .trim()
        .substring(10)
        .split(':')
        .reduce((all: any, curr, i) => {
            all[keyMap[i]] = curr
            return all
        }, {})

    try {
        const data = JSON.parse(await readFile(`${result.file}.map`, 'utf8'))
        data.sourceRoot = path.dirname(result.file)
        const consumer = await new SourceMapConsumer(data)
        const info = consumer.originalPositionFor({
            line: result.line,
            column: result.column,
        })
        result = info
        consumer.destroy()
    } catch {}

    return <ErrorPosition>result
}

export const getTime = (): string =>
    new Intl.DateTimeFormat('en-GB', { timeStyle: 'medium' }).format(new Date())

export interface ReducedSuiteResults {
    description: string
    passed: Array<TestResult>
    failed: Array<TestResult>
    errors: Array<[string, CodedError]>
}

export const reduceTestSuiteResults = async ({
    results,
}: {
    results: Array<TestSuiteResults>
}): Promise<Array<ReducedSuiteResults>> => {
    return Promise.all(
        results.map(async (result) => ({
            description: result.description,
            failed: await Promise.all(
                result.results
                    .filter((i) => i.error !== null)
                    .map(async (i) => {
                        i.error!.position = await getOriginalPosition(
                            i.error!.stack!.split('\n')[1]
                        )
                        return i
                    })
            ),
            passed: result.results.filter((i) => i.error === null),
            errors: await Promise.all(
                Object.entries(result.errors).map(async ([k, error]) => {
                    let err: CodedError = error
                    err.position = await getOriginalPosition(
                        error.stack!.split('\n')[1]
                    )
                    return [k, error]
                })
            ),
        }))
    )
}
