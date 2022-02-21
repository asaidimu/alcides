import EventEmitter from 'events'
import glob from 'fast-glob'
import fs from 'fs'
import path from 'path'
import { exitWithInvalidConfigError } from '../Errors.js'

export const watch = async ({
    file,
    events,
    onChange,
}: {
    file: string | Array<string>
    events: EventEmitter
    onChange: () => any
}) => {
    const files = Array.isArray(file) ? file : [file]

    const ac = new AbortController()

    events.on('stop', (_) => ac.abort())

    files.forEach((file) => {
        try {
            fs.watch(file, { signal: ac.signal }, onChange)
        } catch (e) {
            exitWithInvalidConfigError(e)
        }
    })
}

export const find = async ({ globs }: { globs: string | Array<string> }) => {
    const paths = await glob(globs)

    return paths.map((name) => path.format({ base: name, dir: process.cwd() }))
}
