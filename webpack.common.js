// @flow
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

/*::
type Target = {|
    name: string, // the name of output JS/CSS
    entry: string, // the path to the entry point
    library?: string // the name of the exported module
|};
*/

/**
 * List of targets to build
 */
const targets /*: Array<Target> */ = [
    {
        name: 'katex',
        entry: './katex.webpack.js',
        library: 'katex',
    },
    {
        name: 'contrib/auto-render',
        entry: './contrib/auto-render/auto-render.js',
        library: 'renderMathInElement',
    },
    {
        name: 'contrib/copy-tex',
        entry: './contrib/copy-tex/copy-tex.js',
    },
    {
        name: 'contrib/mathtex-script-type',
        entry: './contrib/mathtex-script-type/mathtex-script-type.js',
    },
];

/**
 * Create a webpack config for given target
 */
function createConfig(target /*: Target */, dev /*: boolean */,
        minimize /*: boolean */) /*: Object */ {
    const cssLoader = {
        loader: 'css-loader',
        options: {
            minimize, // cssnano
        },
    };
    return {
        context: __dirname,
        entry: {
            [target.name]: target.entry,
        },
        output: {
            filename: minimize ? '[name].min.js' : '[name].js',
            library: target.library,
            libraryTarget: 'umd',
            libraryExport: 'default',
            path: path.resolve(__dirname, 'build'),
            publicPath: dev ? '/' : '',
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: 'babel-loader',
                },
                {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [cssLoader],
                    }),
                },
                {
                    test: /\.less$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [cssLoader, {
                            loader: 'less-loader',
                        }],
                    }),
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
        externals: 'katex',
        plugins: [
            new webpack.EnvironmentPlugin({
                NODE_ENV: dev ? 'development' : 'production',
            }),
            dev && new webpack.NamedModulesPlugin(),
            minimize && new UglifyJsPlugin({
                uglifyOptions: {
                    output: {
                        ascii_only: true,
                    },
                },
            }),
            new ExtractTextPlugin({
                filename: minimize ? '[name].min.css' : '[name].css',
                disable: dev,
            }),
        ].filter(Boolean),
        devtool: dev && 'inline-source-map',
    };
}

module.exports = {
    targets,
    createConfig,
};
