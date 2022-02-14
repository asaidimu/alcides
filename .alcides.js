export default {
    include: ['dist/tests/*.js'],
    timeout: 2000,
    watch: process.env.NODE_ENV == 'development',
    files: ['dist'],
    parallel: false,
    verbose: false,
}
