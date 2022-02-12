import { createRequire } from 'module'
import { access } from 'fs/promises'
import { constants } from 'fs'
import path from 'path'

export interface Config {
    include: string | Array<string>
    timeout: number
    workers: number
    parallel: boolean
    watch: boolean
    files: []
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

export const readConfig = async (): Promise<Config> => {
    const file = await getConfigFile()

    const config: Config = {
        include: 'tests',
        workers: 2,
        timeout: 1000,
        parallel: false,
        watch: false,
        files: [],
    }

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
