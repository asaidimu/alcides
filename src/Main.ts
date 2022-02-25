import runTests, { runOnFileChange } from './core/TestRunner.js'
import { report, startUI } from './ui/UI.js'

export default async () => {
    const config = (await import('./Config.js')).default

    if (config.watch) {
        const events = startUI({ config })
        runOnFileChange({ config, events })
    } else {
        const results = await runTests({ config })
        await report(Object.assign(results!, { verbose: config.verbose }))

        if (results!.hasErrors!()) {
            process.exit(123)
        }
    }
}
