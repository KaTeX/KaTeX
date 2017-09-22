const path = require('path');

module.exports = {
    entry: path.join(__dirname, 'katex.js'),
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'main.js',
        publicPath: 'build/',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules\//,
            },
        ],
    },
};
