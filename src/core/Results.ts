import { setPosition } from './SourceMap.js'

export const createTestRunnerOutput = (): TestRunnerOutput => ({
    results: {},
    errors: {
        test: [],
        hook: [],
        load: [],
    },
})

export const combineOutPut = (
    output: Array<TestRunnerOutput>
): TestRunnerOutput => {
    const combineObjectEntries = (
        all: TestRunnerOutput,
        [key, value]: [string, Array<any>]
    ) => {
        if (Array.isArray(all[key])) all[key] = all[key].concat(value)
        else all[key] = value
        return all
    }

    const reducer = (all: TestRunnerOutput, curr: TestRunnerOutput) => {
        return Object.entries(all).reduce((a, [key, value]: [string, any]) => {
            const entries: any = [value, curr[key]].map(Object.entries).flat()
            a[key] = entries.reduce(combineObjectEntries, {})
            return a
        }, <TestRunnerOutput>{})
    }

    return output.reduce(reducer)
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
    const errors = Object.entries(output.errors).map(
        ([key, value]: [string, Array<TestError>]) => {
            return [key, value.map(copyError)]
        }
    )

    output.errors = Object.fromEntries(errors)
    return output
}

export const positionErrors = async (input: {
    [key: string]: Array<TestError>
}): Promise<any> => {
    const errors = await Promise.all(
        Object.entries(input).map(
            async ([key, value]: [string, Array<TestError>]) => {
                return [key, await Promise.all(value.map(setPosition))]
            }
        )
    )
    return Object.fromEntries(errors)
}

export const aggregateOutPut = async ({
    results,
    errors,
}: {
    results: Array<TestSuiteResults>
    errors: Array<TestError>
}): Promise<TestRunnerOutput> => {
    let output: TestRunnerOutput = createTestRunnerOutput()
    output.errors.load = errors

    output = results.reduce((all: TestRunnerOutput, curr: TestSuiteResults) => {
        all.results[curr.id] = curr.results

        Object.entries(curr.errors).forEach(
            ([key, value]: [string, Array<TestError>]) => {
                if (Array.isArray(all.errors[key])) {
                    all.errors[key] = all.errors[key].concat(value)
                } else {
                    all.errors[key] = value
                }
            }
        )

        return all
    }, output)

    output.errors = await positionErrors(output.errors)

    return serializeOutPutErrors({ output })
}
