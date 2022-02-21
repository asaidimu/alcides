import runTests, { hasErrors } from './core/TestRunner.js'
import { report, startUI } from './ui/UI.js'

export default async () => {
    const config = (await import('./Config.js')).default

    if (config.parallel || !config.watch) {
        const results = await runTests({ config })

        await report(Object.assign(results!, { verbose: config.verbose }))

        if (hasErrors(results!)) {
            process.exit(123)
        }
    } else {
        const events = startUI({ config })
        runTests({ config, events })
    }
}
