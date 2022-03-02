import yargs from 'yargs'

export const getArguments = (): Arguments => {
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
            describe: 'Path or glob to test files.',
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
        config: {
            type: 'string',
            alias: 'c',
            describe: 'Path to alcides configuration',
        },
        lsp: {
            type: 'boolean',
            describe: 'Start alcides as an LSP provider.',
        },
    }

    const epilog = 'Documentation at https://www.npmjs.com/package/alcides'

    const usage = 'Usage:\n  alcides [opts..]'
    return <Arguments>(
        yargs(process.argv.slice(2))
            .options(args)
            .usage(usage)
            .alias('h', 'help')
            .epilog(epilog).argv
    )
}

export default getArguments
