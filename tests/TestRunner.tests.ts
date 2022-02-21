import runTests from '../src/core/TestRunner.js'
import { Config } from '../src/Config.js'

suite('Alcides Test Runner', () => {
    interface State {
        config: Config
    }

    setUp((): State => {
        const config: Config = {
            include: ['tests/fixtures/tests/*.js'],
            timeout: 2000,
            workers: 2,
            parallel: false,
            watch: false,
            files: [],
            verbose: true,
        }

        return { config }
    })

    test('Run test from files.', async ({ config }: State) => {
        const output = await runTests({ config })
        assert.equal(Object.entries(output!.errors).length, 1) // test3 fails to load
        assert.equal(output!.results.length, 8) // 8 of 9 run
    })

    test('Run tests in parallel', async ({ config }) => {
        config.parallel = true
        const output = await runTests({ config })
        assert.equal(Object.entries(output!.errors).length, 1)
        assert.equal(output!.results.length, 8)
    })
})
