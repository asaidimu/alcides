import { spawn } from 'child_process'

suite('Alcides', () => {
    test('It runs', async () => {
        const alcides = spawn('node', [
            `${process.cwd()}/dist/index.js`,
            '--no-watch',
            '--no-parallel',
            '-i',
        ])

        alcides.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })
        const exitCode = await new Promise((resolve) => {
            alcides.on('exit', (code) => resolve(code))
        })

        assert.equal(0, exitCode)
    })
})
