import { ALCIDES, EVENT_RUNNER_DONE, getSymbolName } from '../src/Symbols.js'
import TestCaseRunner from '../src/TestCaseRunner.js'
import {
    createTestSuiteCollector,
    TestSuiteCollector,
} from '../src/TestSuite.js'
import TestSuiteRunner, { TestSuiteResults } from '../src/TestSuiteRunner.js'

suite('Alcides', () => {
    test('Short hand.', async () => {
        const {
            getTestSuites,
            suite,
            setUp,
            tearDown,
            test,
        }: TestSuiteCollector = createTestSuiteCollector()

        const message = 'Lorem Ipsum'
        const id = 'Example'

        suite(id, () => {
            setUp(() => ({ message }))

            tearDown(() => {})

            test(id, ({ message }: any) => {
                throw new Error(message)
            })
        })

        const runner = new TestSuiteRunner(new TestCaseRunner())
        runner.add(getTestSuites())

        const suiteResults: Array<TestSuiteResults> = await new Promise(
            (resolve) => {
                runner.on(EVENT_RUNNER_DONE, resolve)
                runner.run()
            }
        )

        const { results } = suiteResults[0]
        const { error } = results[id]
        assert.deepEqual(error!.message, message)
    })

    test('Can get SymbolName', () => {
        assert.deepEqual(getSymbolName(ALCIDES), 'ALCIDES')
    })
})
