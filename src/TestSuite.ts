import { TestCaseData } from './TestCase.js'

export interface TestSuite {
    [key: string]: any
    id: string
    hasSetUp: boolean
    hasTearDown: boolean
    setUp: Function
    tearDown: Function
    tests: TestCaseData[]
    testSuites: TestSuite[]
}

const initTestSuite = (id: string): TestSuite => ({
    id,
    hasSetUp: false,
    hasTearDown: false,
    setUp: () => {},
    tearDown: () => {},
    tests: [],
    testSuites: [],
})

export interface TestSuiteCreator {
    createTestSuite: (id: string, fn: Function) => void
    addTestCase: (id: string, fn: Function) => void
    addSetUp: (fn: Function) => void
    addTearDown: (fn: Function) => void
    getTestSuites: () => TestSuite[]
}

export const TestSuiteCreator = (): TestSuiteCreator => {
    const testSuites: TestSuite[] = []
    const stack: TestSuite[] = []
    let current: TestSuite | null = null

    const createTestSuite = (id: string, fn: Function) => {
        const data = initTestSuite(id)

        if (current !== null) {
            stack.push(current)
        }
        current = data

        fn()

        if (stack.length > 0) {
            const prev = stack.pop()
            prev!.suites.push(current)
            current = prev!
        } else {
            testSuites.push(data)
            current = null
        }
    }

    const addTestCase = (id: string, testFunction: Function) => {
        if (current === null)
            throw new Error(`Cannot add tests outside of a suite.`)

        current.tests.push({
            id,
            testFunction,
        })
    }

    const addSupportCallback = (id: string, check: string, fn: Function) => {
        if (current === null) {
            throw new Error(`Cannot call ${id} outside of suite.`)
        }

        if (current![check]) {
            throw new Error(`Cannot call ${id} twice.`)
        }

        current[id] = fn
        current[check] = true
    }

    const addTearDown = (tearDown: Function) =>
        addSupportCallback('tearDown', 'hasTearDown', tearDown)

    const addSetUp = (setUp: Function) =>
        addSupportCallback('setUp', 'hassetUp', setUp)

    return {
        createTestSuite,
        addTestCase,
        addSetUp,
        addTearDown,
        getTestSuites() {
            return testSuites
        },
    }
}

export default TestSuiteCreator
