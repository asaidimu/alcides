import chalk from 'chalk'

export const ERR_TEST_RUN_TIMEOUT = Symbol.for('TestRunTimedOut')
export const ERR_INVALID_ACTION = Symbol.for('InvalidAction')
export const ERR_UNKNOWN_SYMBOL = Symbol.for('UnknownSymbol')
export const timeoutError = (description: string | symbol) => {
    const error: any = new Error(`TestCase '${String(description)}' timed out.`)
    error.code = ERR_TEST_RUN_TIMEOUT
    return error
}

export const invalidActionError = (description: string | symbol) => {
    const error: any = new Error(`Invalid call to ${String(description)}`)
    error.code = ERR_INVALID_ACTION
    return error
}

export const unknownSymbolError = (symbol: symbol) => {
    const error: any = new Error(`Unknown symbol ${String(symbol)}`)
    error.code = ERR_UNKNOWN_SYMBOL
    return error
}

export const exitWithInvalidConfigError = (error: any) => {
    if (error.code === 'ENOENT') {
        console.log()
        console.log(`    ${chalk.red('Error')}`)
        console.log(
            `    The provided include path ${chalk.blue(
                error.path
            )} does not exist!`
        )
        console.log('    Please check your configurations.')
        console.log()
    }
    process.exit(1)
}
