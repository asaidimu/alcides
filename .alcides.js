export default {
    include: ['dist/tests'],
    timeout: 2000,
    watch: process.env.NODE_ENV == 'development',
    files: ['dist'],
}
