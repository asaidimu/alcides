import { combineOutPut, copyError } from '../../src/core/Results.js'

suite('Results', () => {
    test('Test output combination.', () => {
        const outputs: Array<TestRunnerOutput> = [
            {
                results: { A: [{ id: 'a', duration: 0, passed: false }] },
                errors: [{ id: 'a', name: 'a', message: 'a' }],
            },
            {
                results: {
                    A: [{ id: 'b', duration: 0, passed: false }],
                    B: [{ id: 'a', duration: 0, passed: false }],
                },
                errors: [{ id: 'b', name: 'b', message: 'b' }],
            },
        ]

        const output = combineOutPut(outputs)
        assert.deepEqual(
            {
                results: {
                    A: [
                        { id: 'a', duration: 0, passed: false },
                        { id: 'b', duration: 0, passed: false },
                    ],
                    B: [{ id: 'a', duration: 0, passed: false }],
                },
                errors: [
                    { id: 'a', name: 'a', message: 'a' },
                    { id: 'b', name: 'b', message: 'b' },
                ],
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
