import runTests from '../../src/core/TestRunner.js'

suite('Test Runner', () => {
    interface State {
        config: Config
        getPassed: { (a: any): number }
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

        const getPassed = (input: {
            [key: string]: Array<TestResult>
        }): number => {
            const passed = Object.values(input).reduce(
                (all: number, results: Array<TestResult>) => {
                    all += results.filter((r) => r.passed === true).length
                    return all
                },
                0
            )

            return passed
        }

        return { config, getPassed }
    })

    test('Run test from files.', async ({ config, getPassed }: State) => {
        const output: TestRunnerOutput = await runTests({ config })

        const passed = getPassed(output.results)
        assert.equal(output!.errors.length, 1) // test 3 fails to load
        assert.equal(passed, 8) // 8 of 9 run
    })

    test('Run tests in parallel', async ({ config, getPassed }) => {
        config.parallel = true
        const output = await runTests({ config })
        const passed = getPassed(output.results)
        assert.equal(output!.errors.length, 1) // test 3 fails to load
        assert.equal(passed, 8) // 8 of 9 run
    })
})
