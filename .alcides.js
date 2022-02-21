export default {
    include: ['dist/tests/*.js'],
    timeout: 3000,
    watch: process.env.NODE_ENV == 'development',
    files: ['dist'],
    parallel: false,
    verbose: false,
}
