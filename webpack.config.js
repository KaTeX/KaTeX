const path = require('path');

module.exports = {
    entry: {
        katex: path.join(__dirname, 'katex.js'),
        'copy-tex': path.join(__dirname, 'contrib', 'copy-tex', 'copy-tex.js'),
        'renderMathInElement': path.join(__dirname, 'contrib', 'auto-render', 'auto-render.js'),
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
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
    devtool: 'eval-source-map',
};
