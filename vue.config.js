module.exports = {
    devServer: {
        host: 'localhost',
        port: 8081,
        https: false,
        open: true,
        hotOnly: true,
        // proxy: 'http://localhost:8000'
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                pathRewrite: {
                    '/api': ''
                }
            }
        }
    }
}