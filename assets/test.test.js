suite('TestSuite #1', () => {
    setUp(() => ({ number: 123456789 }))

    test('Test that number is 123456789', ({ number }) => {
        assert.equal(number, 123456789)
    })
})
