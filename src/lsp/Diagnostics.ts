import {
    Connection,
    Diagnostic,
    DiagnosticSeverity,
    MessageType,
    PublishDiagnosticsParams,
    ShowMessageNotification,
} from 'vscode-languageserver/node.js'

interface SParams {
    results: TestRunnerOutputResults
    builder: { (summary: { passed: number; failed: number }): string }
}
export const getResultsSummary = ({ results, builder }: SParams): string => {
    let totals: { passed: number; failed: number } = Object.values(results)
        .flat()
        .reduce(
            (all, curr: TestResult) => {
                curr.passed ? all.passed++ : all.failed++
                return all
            },
            { passed: 0, failed: 0 }
        )

    return builder(totals)
}

export const getDiagnosticsParams = (
    err: TestError
): PublishDiagnosticsParams => ({
    uri: `file://${err.position!.source}`,
    diagnostics: <Array<Diagnostic>>[
        {
            range: {
                start: {
                    line: err.position!.line - 1,
                    character: 0,
                },
                end: {
                    line: err.position!.line,
                    character: 0,
                },
            },
            source: 'alcides',
            severity: DiagnosticSeverity.Warning,
            message: `${err.id} ${err.message}`,
        },
    ],
})

type HandlerParams = { connection: Connection; state: { uri: Array<string> } }
type EventHandler = { (...args: Array<any>): void }

export const handleTestRunStarted = (param: HandlerParams): EventHandler => {
    const { connection, state } = param
    const eventHandler = async () => {
        connection.sendNotification(ShowMessageNotification.type, {
            type: MessageType.Info,
            message: `Running tests.`,
        })

        let uri
        while ((uri = state.uri.pop())) {
            connection.sendDiagnostics({
                uri,
                diagnostics: [],
            })
        }
    }

    return eventHandler
}

export const handleTestRunCompleted = (param: HandlerParams): EventHandler => {
    const { connection, state } = param
    const eventHandler = async (results: TestRunnerOutput) => {
        if (results.errors.length !== 0) {
            const params = results.errors.map(getDiagnosticsParams)

            params.forEach((param: PublishDiagnosticsParams) => {
                state.uri.push(param.uri)
                connection.sendDiagnostics(param)
            })
        }

        connection.sendNotification(ShowMessageNotification.type, {
            type: MessageType.Info,
            message: getResultsSummary({
                results: results.results,
                builder: ({
                    passed,
                    failed,
                }: {
                    passed: number
                    failed: number
                }) =>
                    ` Test Run Completed\n ${passed} passed, ${failed} failed.`,
            }),
        })
    }

    return eventHandler
}
