import runTests from './core/TestRunner.js'
import { report, startUI } from './ui/UI.js'

export default async () => {
    const config = (await import('./Config.js')).default

    if (config.parallel || !config.watch) {
        const results = await runTests({ config })
        report(Object.assign(results!, { verbose: config.verbose }))
    } else {
        const events = startUI({ config })
        runTests({ config, events })
    }
}
