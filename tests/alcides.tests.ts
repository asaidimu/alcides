import { ALCIDES, getSymbolName } from '../src/Constants.js'

suite('Alcides', () => {
    test('Can get SymbolName', () => {
        assert.deepEqual(getSymbolName(ALCIDES), 'ALCIDES')
    })
})
