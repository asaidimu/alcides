import { getConfigFile, readConfig } from './File.js'
import getArguments from './Arguments.js'

export interface Config {
    verbose: boolean
    include: string | Array<string>
    timeout: number
    workers: number
    parallel: boolean
    watch: boolean
    files: []
}

const defaultConfig: Config = {
    include: ['tests/**/*.js', 'test/**/*.js'],
    workers: 0,
    timeout: 1000,
    parallel: false,
    watch: false,
    files: [],
    verbose: true,
}

export default await (async (): Promise<Config> => {
    const file = await getConfigFile()
    const config = (await readConfig({ file })) || {}

    const argv = getArguments()

    const result = Object.assign(defaultConfig, config, argv)

    return <Config>result
})()