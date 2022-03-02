import { EventEmitter } from 'events'
import {
    Connection,
    createConnection,
    InitializeResult,
    ProposedFeatures,
} from 'vscode-languageserver/node.js'
import { RESULTS, STARTED } from '../core/Constants.js'
import { runOnFileChange } from '../core/TestRunner.js'
import { handleTestRunCompleted, handleTestRunStarted } from './Diagnostics.js'

export default async (config: Config) => {
    const connection: Connection = createConnection(
        ProposedFeatures.all,
        process.stdin,
        process.stdout
    )

    connection.onInitialize(
        (): InitializeResult => ({
            capabilities: {
                codeActionProvider: true,
                hoverProvider: true,
            },
        })
    )

    connection.onInitialized(async () => {
        const events = new EventEmitter()
        const state: { uri: Array<string> } = { uri: [] }

        events.on(STARTED, handleTestRunStarted({ connection, state }))
        events.on(RESULTS, handleTestRunCompleted({ connection, state }))

        runOnFileChange({ config, events })
    })

    connection.onExit(() => process.exit())

    connection.listen()
}
