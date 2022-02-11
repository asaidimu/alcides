export interface TestCase {
    description: string

    testFunction: TestFunction
}

export type TestFunction = (state?: any) => void | Promise<void>

export default TestCase
