export interface TestCase {
    id: string
    testFunction: TestFunction
}

export interface TestFunction {
    (state?: any): void | Promise<void>
}
