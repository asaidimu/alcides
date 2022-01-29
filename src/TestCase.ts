/** @namespace TestCase */

/**
 * TestCase
 * @name TestCase
 * @memberof TestCase
 * */
export interface TestCase {
    /**
     * The description/id of the test case
     *
     * @name description
     */
    description: string | symbol

    /**
     * The test function that will run for this test case.
     * @name testFunction
     * @type TestFunction
     */
    testFunction: TestFunction
}

/**
 * A TestFunction
 * @typedef TestFunction
 * @name TestFunction
 * @memberof TestCase
 * @params { any } state - state used within the testFunction
 * */
export type TestFunction = (state?: any) => void | Promise<void>

export default TestCase
