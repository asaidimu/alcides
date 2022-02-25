export default {
    include: ['dist/tests/**/*.js'],
    timeout: 5000,
    watch: process.env.NODE_ENV == 'development',
    files: ['dist'],
    parallel: false,
    verbose: false,
}
