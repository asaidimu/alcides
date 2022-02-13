import { createRequire } from 'module'
import { access } from 'fs/promises'
import { constants } from 'fs'
import path from 'path'
import yargs from 'yargs'

interface Arguments {
    verbose: boolean
    watch: boolean
}

export interface Config extends Arguments {
    include: string | Array<string>
    timeout: number
    workers: number
    parallel: boolean
    watch: boolean
    files: []
}

const args: any = {
    verbose: {
        type: 'boolean',
        default: true,
        describe: 'Show verbose reports.',
    },
    watch: {
        type: 'boolean',
        default: false,
        describe: 'Run in watch mode.',
    },
    // parallel: { type: "boolean", default: false, describe: "Run tests in parallel." }
}

const config: Config = {
    include: 'tests/*.js',
    workers: 2,
    timeout: 1000,
    parallel: false,
    watch: false,
    files: [],
    verbose: true,
}

const require = createRequire(process.cwd())

export const getConfigFile = async (): Promise<string | void> => {
    const paths: Array<string> = [
        '.alcidesrc',
        '.alcides.json',
        '.alcides.js',
        'alcides.json',
        'alcides.config.js',
        'package.json',
    ]

    try {
        const file = await Promise.any(
            paths
                .map((base) => path.format({ dir: process.cwd(), base }))
                .map(async (entry) => {
                    await access(entry, constants.R_OK)
                    return Promise.resolve(entry)
                })
        )
        return file
    } catch {}
}

export const readConfig = async (): Promise<any> => {
    const file = await getConfigFile()

    if (file) {
        let data

        if (RegExp('.*js$').test(file)) {
            data = (await import(file)).default
        } else {
            data = require(file)
        }

        if (file.match(/package\.json/)) {
            if (data.alcides) {
                data = data.alcides
            } else if (data.tests) {
                data = data.tests
            } else {
                data = {}
            }
        }

        Object.assign(config, data)
    }

    return config
}

export default await (async (): Promise<Config> => {
    const config = await readConfig()
    const epilog = 'Docs can be found at https://github.com/asaidimu/alcides'
    const usage = 'Usage:\n  alcides [opts..]'

    const argv = yargs(process.argv.slice(2))
        .options(args)
        .usage(usage)
        .alias('h', 'help')
        .epilog(epilog).argv

    return Object.assign(argv, config)
})()
