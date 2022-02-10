import path from 'path'
import { readFile } from 'fs/promises'

export interface Config {
    include: string | Array<string>
    timeout: number
    workers: number
    parallel: boolean
}

export const readConfig = async (): Promise<Config> => {
    const package_json = path.format({
        dir: process.cwd(),
        base: 'package.json',
    })
    const json = await readFile(package_json, { encoding: 'utf8' })

    const { include, workers, timeout, parallel } = JSON.parse(json).tests

    return {
        include: include ? include : 'tests',
        workers: workers ? workers : 2,
        timeout: timeout ? timeout : 1000,
        parallel: parallel ? parallel : false,
    }
}
