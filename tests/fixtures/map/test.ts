export interface MakeThisFileLong {
    value: string
}

export interface ACopyInterface {
    message: string
}

export function unKnown() {
    return (): MakeThisFileLong => {
        const x: MakeThisFileLong = { value: 'Hello, World!' }
        return x
    }
}

export interface OneLastInterface {
    id: number
}

export default () => {
    return unKnown()
}
