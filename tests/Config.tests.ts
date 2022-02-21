import { Config, readConfig } from '../src/Config.js'
import glob from 'fast-glob'

suite('Alcides Config', () => {
    test('Configs are loaded from a file.', async () => {
        const config: Config = await readConfig()

        assert.isArray(config.include)
        assert.isArray(config.files)
        assert.isBoolean(config.watch)
        assert.isNumber(config.timeout)
        assert.isNumber(config.workers)
        assert.isBoolean(config.parallel)
        assert.isBoolean(config.verbose)
    })

    test('Glob can find files.', async () => {
        const paths = [
            'tests/fixtures/glob/src/*.js',
            'tests/fixtures/glob/*.js',
        ]
        const files = [
            'tests/fixtures/glob/src/example.js',
            'tests/fixtures/glob/example.js',
        ]
        const found = await glob(paths)
        assert.deepEqual(files, found)
    })
})
