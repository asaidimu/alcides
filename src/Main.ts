import runTests, { runOnFileChange } from './core/TestRunner.js'
import { report, startUI } from './ui/UI.js'

export default async () => {
    const config = (await import('./config/Config.js')).default

    if (config.lsp!) {
        const server = (await import('./lsp/Server.js')).default
        return server(config)
    }

    if (config.watch) {
        const events = startUI({ config })
        return runOnFileChange({ config, events })
    }

    const results = await runTests({ config })

    await report(Object.assign(results!, { verbose: config.verbose }))

    if (results.errors.length > 0) {
        process.exit(123)
    }
}
