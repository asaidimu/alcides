import EventEmitter from 'events'
import glob from 'fast-glob'
import fs from 'fs'
import path from 'path'
import { exitWithInvalidConfigError } from './Errors.js'

interface watchOptions {
    file: string | Array<string>
    events: EventEmitter
    onChange: () => any
}
export const watch = async ({ file, events, onChange }: watchOptions) => {
    const files = Array.isArray(file) ? file : [file]

    const ac = new AbortController()
    events.on('stop', (_) => ac.abort())

    files.forEach((f) => {
        try {
            fs.watch(f, { signal: ac.signal }, onChange)
        } catch (e) {
            exitWithInvalidConfigError(e)
        }
    })
}

export const find = async ({ globs }: { globs: string | Array<string> }) => {
    const all = Array.isArray(globs) ? globs : [globs]
    const paths = await glob(all.filter((i: string) => i.length > 0))

    return paths.map((name) => path.format({ base: name, dir: process.cwd() }))
}
