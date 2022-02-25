import { readConfig } from '../src/config/File.js'

suite('Config', () => {
    test('Configs are loaded from a file.', async () => {
        const files = ['alcides.config.js', 'alcides.json']

        for (const file of files) {
            const config: Config = (await readConfig({
                file: `${process.cwd()}/tests/fixtures/config/${file}`,
            }))!

            assert.isArray(config.include)
            assert.isArray(config.files)
            assert.isBoolean(config.watch)
            assert.isNumber(config.timeout)
            assert.isNumber(config.workers)
            assert.isBoolean(config.parallel)
            assert.isBoolean(config.verbose)
        }
    })
})
