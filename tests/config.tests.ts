import { Config, getConfigFile, readConfig } from '../src/Config.js'

suite('Alcides Config', () => {
    test('Configs are defined in a file.', async () => {
        const file = await getConfigFile()
        assert.isDefined(file)
        assert.isTrue(RegExp('\\.alcides.json').test(file!))
    })

    test('Configs are loaded.', async () => {
        const config: Config = await readConfig()

        assert.deepEqual(config.timeout, 2000)
        assert.deepEqual(config.workers, 2)
        assert.isFalse(config.parallel)

        assert.equal(4, Object.values(config).length)
    })
})
