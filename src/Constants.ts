import { unknownSymbolError } from './Errors.js'

export const RESULTS = Symbol.for('TestRunnerCompleted Event')
export const TIMEOUT = Symbol.for('TestCaseRunTimedOut Event')
export const ALCIDES = Symbol.for('ALCIDES')
export const SETUP_HOOK = 'SetUp'
export const TEARDOWN_HOOK = 'TearDown'
export const ERR_TEST_RUN_TIMEOUT = 'TestRunTimedOut'
export const ERR_INVALID_ACTION = 'InvalidAction'
export const ERR_UNKNOWN_SYMBOL = 'UnknownSymbol'
export const EXIT_INVALID_CONFIG = 123

const symbols: any = {
    [ALCIDES]: 'ALCIDES',
    [ERR_INVALID_ACTION]: 'InvalidAction',
    [ERR_TEST_RUN_TIMEOUT]: 'TestRunTimedOut',
    [ERR_UNKNOWN_SYMBOL]: 'UnknownSymbol',
    [TIMEOUT]: 'TestCase Run TimedOut Event',
    [SETUP_HOOK]: 'SetUp Hook',
    [TEARDOWN_HOOK]: 'TearDown Hook',
}

const proxy = new Proxy(symbols, {
    get: function (target, prop: symbol | string) {
        const val = target[prop]

        if (!val) throw unknownSymbolError(String(prop))

        return val
    },
})

export const getSymbolName = (symbol: symbol | string): string => {
    return proxy[symbol]
}
