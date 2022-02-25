import { decorateTestFunction } from './TestCase.js'

export const runTestCase = async (
    opts: TestCaseRunnerParams
): Promise<TestCaseRunnerResults> => {
    const test = decorateTestFunction(opts)
    const { error, duration } = await test()
    return [{ id: opts.id, duration, passed: error === null }, error]
}

export default runTestCase
