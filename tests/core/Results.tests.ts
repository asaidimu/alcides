import { combineOutPut, copyError } from '../../src/core/Results.js'

suite('Results', () => {
    test('Test output combination.', () => {
        const outputs: Array<TestRunnerOutput> = [
            {
                results: { A: [] },
                errors: { test: [], hook: [], load: [] },
            },
            { results: { B: [] }, errors: { test: [], hook: [], load: [] } },
        ]

        const output = combineOutPut(outputs)
        assert.deepEqual(
            {
                results: { A: [], B: [] },
                errors: { test: [], hook: [], load: [] },
            },
            output
        )
    })

    test('Test Copy Error', () => {
        const error = <TestError>new Error('This is an error')
        error.id = 'asdfgh'
        error.code = 'qwertyu'

        const copy = copyError(error)

        assert.deepEqual(error.stack, copy.stack)
        assert.deepEqual(error.id, copy.id)
        assert.deepEqual(error.code, copy.code)
    })
})
