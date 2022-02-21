suite('TestSuite #3', () => {
    // this file will throw an error
    throw
    setUp(() => ({ number: 123456789 }))

    test('Test that number is 123456789', ({ number }) => {
        assert.equal(number, 123456789)
    })
})
