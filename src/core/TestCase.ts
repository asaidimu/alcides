export interface TestCase {
    description: string
    testFunction: TestFunction
}

export interface TestFunction {
    (state?: any): void | Promise<void>
}
