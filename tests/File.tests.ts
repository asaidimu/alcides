import { mkdir, rm, writeFile } from 'fs/promises'
import EventEmitter from 'events'
import { find, watch } from '../src/core/File.js'

suite('File.', () => {
    test('Can obtain tests.', async () => {
        const expected = Array(9)
            .fill('')
            .map(
                (_, i: number) =>
                    `${process.cwd()}/assets/tests/${i + 1}.test.js`
            )
        const testGlobs = ['assets/tests/**/*.test.js']

        const found = await find({ globs: testGlobs })
        assert.deepEqual(expected, found)
    })

    test('Can watch a file.', async () => {
        const path = '/tmp/alcides/tests'
        const file = `${path}/a.txt`

        const events = new EventEmitter()
        await mkdir(path, { recursive: true })

        const result = await new Promise(async (resolve: any) => {
            watch({
                file: path,
                events,
                onChange: () => {
                    events.emit('stop')
                    resolve(1)
                },
            })

            await writeFile(file, 'Hello, World!')
        })

        await rm(file)
        assert.equal(1, result)
    })
})
