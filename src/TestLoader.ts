import { opendir, stat } from 'fs/promises'
import TestSuiteCreator, { TestSuite } from './TestSuite.js'

import { assert } from 'chai'
import path from 'path'

declare global {
    var assert: Chai.AssertStatic
    var suite: Function
    var test: Function
    var setUp: Function
    var tearDown: Function
}

export const createTestLoader = () => {
    return async (location: string): Promise<TestSuite[]> => {
        const {
            createTestSuite,
            addTestCase,
            addSetUp,
            addTearDown,
            getTestSuites,
        } = TestSuiteCreator()
        global.assert = assert
        global.suite = createTestSuite
        global.test = addTestCase
        global.setUp = addSetUp
        global.tearDown = addTearDown

        try {
            const dir = await opendir(location)
            for await (const { name } of dir) {
                if (name.match(/.*.js$/)) {
                    await import(path.format({ dir: location, base: name }))
                }
            }
        } catch (e) {
            // TODO: do something with the error //
        }

        return getTestSuites()
    }
}

export default createTestLoader
