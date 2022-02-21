import { TestCase } from './TestCase.js'

export interface SetUpHook {
    (cb: TestHook): void
}

export interface TearDownHook {
    (cb: TestHook): void
}

export interface TestSuite {
    description: string
    tests: TestCase[]
    hooks: { [key: string]: TestHook }
}

export interface TestHook {
    (state?: any): any
    id?: string
}
