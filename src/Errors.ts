import chalk from 'chalk'
import {
    ERR_INVALID_ACTION,
    ERR_TEST_RUN_TIMEOUT,
    ERR_UNKNOWN_SYMBOL,
    EXIT_INVALID_CONFIG,
} from './Constants.js'

export const timeoutError = (description: string) => {
    const error: any = new Error(`TestCase '${String(description)}' timed out.`)
    error.code = ERR_TEST_RUN_TIMEOUT
    return error
}
export const invalidActionError = (description: string) => {
    const error: any = new Error(`Invalid call to ${String(description)}`)
    error.code = ERR_INVALID_ACTION
    return error
}

export const unknownSymbolError = (symbol: string) => {
    const error: any = new Error(`Unknown symbol ${symbol}`)
    error.code = ERR_UNKNOWN_SYMBOL
    return error
}

export const exitWithInvalidConfigError = (error: any) => {
    if (error.code === 'ENOENT') {
        console.log()
        console.log(`    ${chalk.red('Error')}`)
        console.log(
            `    The provided path ${chalk.blue(error.path)} does not exist!`
        )
        console.log('    Please check your configurations.')
        console.log()
    }
    process.exit(EXIT_INVALID_CONFIG)
}
