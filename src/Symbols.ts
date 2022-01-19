export const SetUpFunction = Symbol.for('SetUp')
export const TearDownFunction = Symbol.for('TearDown')

export const getSymbolName = (symbol: Symbol) => {
    switch (symbol) {
        case SetUpFunction:
            return 'Set Up'
        case TearDownFunction:
            return 'Tear Down'
        default:
            return 'Unknown'
    }
}
