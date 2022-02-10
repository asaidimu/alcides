/** @namespace Symbols */

import { unknownSymbolError } from './Errors.js'

/**
 * @name SetUpFunctionSymbol
 * @memberof Symbols
 */
export const SETUP_HOOK = 'SetUp'

/**
 * @name TearDownFunctionSymbol
 * @memberof Symbols
 * */
export const TEARDOWN_HOOK = 'TearDown'

/**
 *
 * @name TestSuiteRunCompleted
 * @memberof Symbols
 */
export const EVENT_SUITE_RUN_COMPLETE = Symbol.for(
    'TestSuiteRunCompleted Event'
)

/**
 *
 * @name TestSuiteRunDone
 * @memberof Symbols
 */
export const EVENT_SUITE_RUN_DONE = Symbol.for('TestSuiteRunDone Event')

/**
 *
 * @name RunnerDone
 * @memberof Symbols
 */
export const EVENT_RUNNER_DONE = Symbol.for('RunnerDone Event')

/**
 *
 * @name TestSuiteRunnerFailedFixtures
 * @memberof Symbols
 */
export const EVENT_SUITE_HOOKS_FAILED = Symbol.for(
    'TestSuiteRunnerFailedFixtures Event'
)

/**
 *
 * @name TestCaseRunCompleted
 * @memberof Symbols
 */
export const EVENT_TEST_RUN_COMPLETE = Symbol.for('TestCaseRunCompleted Event')

/**
 *
 * @name TestCaseRunTimedOut
 * @memberof Symbols
 */
export const EVENT_TEST_RUN_TIMEOUT = Symbol.for('TestCaseRunTimedOut Event')

export const ALCIDES = Symbol.for('ALCIDES')

export const ERR_TEST_RUN_TIMEOUT = 'TestRunTimedOut'
export const ERR_INVALID_ACTION = 'InvalidAction'
export const ERR_UNKNOWN_SYMBOL = 'UnknownSymbol'

/**
 * @function getSymbolName
 * @param { symbol } symbol
 * @return { string } symbolName
 * @memberof Symbols
 */
export const getSymbolName = (symbol: symbol | string): string => {
    const symbols: any = {
        [ALCIDES]: 'ALCIDES',
        [ERR_INVALID_ACTION]: 'InvalidAction',
        [ERR_TEST_RUN_TIMEOUT]: 'TestRunTimedOut',
        [ERR_UNKNOWN_SYMBOL]: 'UnknownSymbol',
        [EVENT_RUNNER_DONE]: 'TestRunner Done Event',
        [EVENT_SUITE_HOOKS_FAILED]: 'TestSuite Hooks Failed Event',
        [EVENT_SUITE_RUN_COMPLETE]: 'TestSuite Run Completed Event',
        [EVENT_SUITE_RUN_DONE]: 'TestSuite Run Done Event',
        [EVENT_TEST_RUN_COMPLETE]: 'TestCase Run Complete Event',
        [EVENT_TEST_RUN_TIMEOUT]: 'TestCase Run TimedOut Event',
        [SETUP_HOOK]: 'SetUp Hook',
        [TEARDOWN_HOOK]: 'TearDown Hook',
    }

    const proxy = new Proxy(symbols, {
        get: function (target, prop: symbol) {
            const val = target[prop]
            if (!val) throw unknownSymbolError(prop)

            return val
        },
    })

    return proxy[symbol]
}
