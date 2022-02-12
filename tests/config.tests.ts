import { Config, readConfig } from '../src/Config.js'

suite('Alcides Config', () => {
    test('Configs are loaded from a file.', async () => {
        const config: Config = await readConfig()

        assert.isArray(config.include)
        assert.isArray(config.files)
        assert.isBoolean(config.watch)
        assert.isNumber(config.timeout)
        assert.isNumber(config.workers)
        assert.isBoolean(config.parallel)

        assert.equal(6, Object.values(config).length)
    })
})
