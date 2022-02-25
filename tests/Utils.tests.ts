import {
    getSourcePosition,
    SourcePosition,
    positionFromStackFrame,
} from '../src/core/Utils.js'

suite('Utils', () => {
    test('Get original file position', async () => {
        const position: SourcePosition = await getSourcePosition({
            source: 'tests/fixtures/map/test.js',
            line: 2,
            column: 5,
        })

        assert.deepEqual(
            {
                source: 'tests/fixtures/map/test.ts',
                line: 10,
                column: 4,
                name: null,
            },
            position
        )
    })

    test('Get position from stack frame', async () => {
        const frames = [
            [
                'at positionFromStackFrame.<anonymous>(file:///home/projects/alcides/dist/src/core/Utils.js:23:10)',
                {
                    source: '/home/projects/alcides/dist/src/core/Utils.js',
                    line: 23,
                    column: 10,
                },
            ],
            [
                'at positionFromStackFrame (file:///home/projects/alcides/dist/src/core/Utils.js:23:10)',
                {
                    source: '/home/projects/alcides/dist/src/core/Utils.js',
                    line: 23,
                    column: 10,
                },
            ],
            [
                'at file:///home/projects/alcides/dist/tests/Utils.js:17:26',
                {
                    source: '/home/projects/alcides/dist/tests/Utils.js',
                    line: 17,
                    column: 26,
                },
            ],
            [
                '  at Module._compile (module.js:456:26)',
                { source: 'Internal: module.js', line: 456, column: 26 },
            ],
            [
                'at node.js:906:3',
                { source: 'Internal: node.js', line: 906, column: 3 },
            ],
        ]

        for (const [frame, expected] of frames) {
            const position: SourcePosition = positionFromStackFrame({
                frame: <string>frame,
            })

            assert.deepEqual(expected, position)
        }
    })
})
