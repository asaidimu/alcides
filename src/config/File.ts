import { createRequire } from 'module'
import { access } from 'fs/promises'
import { constants } from 'fs'
import path from 'path'

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

export const readConfig = async ({
    file,
}: {
    file: string | void
}): Promise<Config | null> => {
    if (!file) {
        return null
    }

    if (!file.match(/^\/.*/))
        file = path.format({ base: file, dir: process.cwd() })

    const require = createRequire(process.cwd())

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

    return data
}
