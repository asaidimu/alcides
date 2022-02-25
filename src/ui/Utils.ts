export const getTime = (): string =>
    new Intl.DateTimeFormat('en-GB', { timeStyle: 'medium' }).format(new Date())
