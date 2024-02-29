const path = require('path');
module.exports = {
    entry: './src_frontend/htmx.js',
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: 'htmx.js',
    },
    mode: 'none',
};
