import {
    invalidActionError,
    timeoutError,
    unknownSymbolError,
} from '../../src/core/Errors.js'
import {
    ERR_INVALID_ACTION,
    ERR_TEST_TIMEOUT,
    ERR_UNKNOWN_SYMBOL,
} from '../../src/core/Constants.js'

suite('Errors', () => {
    test('Time out errors are coded', () => {
        const error = timeoutError()
        assert.deepEqual(ERR_TEST_TIMEOUT, error.code)
    })

    test('Invalid action errors are coded', () => {
        const error = invalidActionError('')
        assert.deepEqual(ERR_INVALID_ACTION, error.code)
    })

    test('Unknown symbol errors are coded', () => {
        const error = unknownSymbolError('')
        assert.deepEqual(ERR_UNKNOWN_SYMBOL, error.code)
    })
})
