import { TestError } from '../src/core/TestCaseRunner.js'
import { copyError } from '../src/core/Worker.js'

suite('Test Runner', () => {
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
