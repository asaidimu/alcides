import { createRequire } from 'module'
import { access } from 'fs/promises'
import { constants } from 'fs'
import path from 'path'
import yargs from 'yargs'

export interface Config {
    verbose: boolean
    include: string | Array<string>
    timeout: number
    workers: number
    parallel: boolean
    watch: boolean
    files: []
}

type Arguments =
    | {
          [x: string]: unknown
          help: unknown
          $0: string
          _: (string | number)[]
      }
    | Promise<{
          [x: string]: unknown
          help: unknown
          $0: string
          _: (string | number)[]
      }>

const getArgv = (): Arguments => {
    const args: any = {
        verbose: {
            type: 'boolean',
            describe: 'Show verbose reports.',
        },
        watch: {
            type: 'boolean',
            describe: 'Run in watch mode.',
        },
        parallel: {
            type: 'boolean',
            describe: 'Run tests in parallel.',
        },
        files: {
            type: 'array',
            alias: 'f',
            describe: 'Files to watch.',
        },
        include: {
            type: 'array',
            alias: 'i',
            describe: 'Files to watch.',
        },
        workers: {
            type: 'number',
            alias: 'r',
            describe: 'Number of workers.',
        },
        timeout: {
            type: 'number',
            alias: 't',
            describe: 'Test timout in ms.',
        },
    }

    const epilog = 'Documentation at https://www.npmjs.com/package/alcides'

    const usage = 'Usage:\n  alcides [opts..]'
    return yargs(process.argv.slice(2))
        .options(args)
        .usage(usage)
        .alias('h', 'help')
        .epilog(epilog).argv
}

const config: Config = {
    include: ['tests/**/*.js', 'test/**/*.js'],
    workers: 2,
    timeout: 1000,
    parallel: false,
    watch: false,
    files: [],
    verbose: true,
}

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
    const require = createRequire(process.cwd())

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

    const argv = getArgv()

    const result = Object.assign(config, argv)
    return result
})()
