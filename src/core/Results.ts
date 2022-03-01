import { setPosition } from './SourceMap.js'

export const createTestRunnerOutput = (): TestRunnerOutput => ({
    results: {},
    errors: [],
})

export const combineOutPut = (
    output: Array<TestRunnerOutput>
): TestRunnerOutput => {
    type TestResultObject = { [key: string]: Array<TestResult> }

    const combineResults = function (
        ...args: Array<TestResultObject>
    ): TestResultObject {
        const entries = args.map(Object.entries).flat()

        return entries.reduce(
            (
                all: TestResultObject,
                [key, value]: [string, Array<TestResult>]
            ) => {
                all[key] = all[key] ? all[key].concat(value) : value
                return all
            },
            {}
        )
    }

    const reducer = (all: TestRunnerOutput, curr: TestRunnerOutput) => {
        all.errors = all.errors.concat(curr.errors)

        all.results = combineResults(all.results, curr.results)

        return all
    }

    return output.reduce(reducer, createTestRunnerOutput())
}

export const copyError = (error: TestError): TestError =>
    <TestError>(
        Object.fromEntries(
            Object.entries(Object.getOwnPropertyDescriptors(error)).map(
                ([key, value]) => [key, value.value]
            )
        )
    )

export const serializeOutPutErrors = ({
    output,
}: {
    output: TestRunnerOutput
}): TestRunnerOutput => {
    output.errors = output.errors.map(copyError)
    return output
}

export const positionErrors = async (input: Array<TestError>): Promise<any> => {
    const errors = await Promise.all(input.map(setPosition))

    return errors
}

export const aggregateOutPut = async ({
    results,
    errors,
}: {
    results: Array<TestSuiteResults>
    errors: Array<TestError>
}): Promise<TestRunnerOutput> => {
    let output: TestRunnerOutput = createTestRunnerOutput()

    output.errors = errors

    output = results.reduce((all: TestRunnerOutput, curr: TestSuiteResults) => {
        all.results[curr.id] = curr.results

        Object.values(curr.errors).forEach((value: Array<TestError>) => {
            all.errors = all.errors.concat(value)
        })

        return all
    }, output)

    output.errors = await positionErrors(output.errors)

    output = serializeOutPutErrors({ output })
    return output
}
