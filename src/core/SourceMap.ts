import { SourceMapConsumer } from 'source-map'
import { readFile } from 'fs/promises'
import path from 'path'

export const getSourcePosition = async ({
    source,
    column,
    line,
}: SourcePosition): Promise<SourcePosition> => {
    let result = { source, column, line }
    try {
        const data = JSON.parse(await readFile(`${source}.map`, 'utf8'))
        data.sourceRoot = path.dirname(source)
        const consumer = await new SourceMapConsumer(data)
        const info = consumer.originalPositionFor({
            line,
            column,
        })
        result = info
        consumer.destroy()
    } catch {}

    return result
}

export const positionFromStackFrame = ({
    frame,
}: {
    frame: string
}): SourcePosition => {
    const getPosition = (frame: Array<string>) => {
        const keys = ['source', 'line', 'column']
        const entries = frame.map((value: string | number, index: number) => [
            keys[index],
            Number.isNaN(Number(value)) ? value : Number(value),
        ])

        const position = Object.fromEntries(entries)
        return <SourcePosition>position
    }

    let uri = frame.trim().slice(3)

    const match = uri.match(/\(.*\)$/g)

    if (match !== null) {
        uri = match.pop()!.slice(1, -1)
    }

    let split = []
    if (uri.match(/file.*/)) {
        split = uri.substring(7).split(':')
    } else {
        split = uri.split(':')
        split[0] = `Internal: ${split[0]}`
    }

    return getPosition(split)
}

export const setPosition = async (error: TestError): Promise<TestError> => {
    const frames = error.stack?.split('\n')

    const position = positionFromStackFrame({
        frame: frames![1],
    })

    error.position = await getSourcePosition(position)
    return error
}
