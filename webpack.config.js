const path = require('path');
module.exports = {
    entry: './src_frontend/frontend.js',
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: 'bundle.js',
    },
    mode: 'none',
};
