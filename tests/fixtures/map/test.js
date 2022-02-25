export function unKnown() {
    return () => {
        const x = { value: 'Hello, World!' }
        return x
    }
}
export default () => {
    return unKnown()
}
//# sourceMappingURL=test.js.map
