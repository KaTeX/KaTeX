// @flow
const path = require('path');
const webpack = require("webpack");
const PORT = 7936;

module.exports = {
    entry: './katex.webpack.js',
    output: {
        filename: 'katex.js',
        library: 'katex',
        libraryTarget: 'umd',
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.less$/,
                use: [{
                    loader: 'style-loader',
                }, {
                    loader: 'css-loader',
                }, {
                    loader: 'less-loader',
                }],
            },
            {
                test: /\.(ttf|woff|woff2)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'fonts/[name].[ext]',
                    },
                }],
            },
        ],
    },
    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development',
        }),
    ],
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'static'),
        // Allow server to be accessed from anywhere, which is useful for
        // testing.  This potentially reveals the source code to the world,
        // but this should not be a concern for testing open-source software.
        disableHostCheck: true,
        port: PORT,
    },
};
