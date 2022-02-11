export interface TestCase {
    description: string

    testFunction: TestFunction
}

export interface TestFunction {
    (state?: any): void | Promise<void>
}

export interface TestHook {
    (state?: any): any
    id?: string
}

export default TestCase
