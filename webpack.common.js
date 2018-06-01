// @flow
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
        mode: dev ? 'development' : 'production',
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
                    use: [
                        dev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        cssLoader,
                    ],
                },
                {
                    test: /\.less$/,
                    use: [
                        dev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        cssLoader,
                        'less-loader',
                    ],
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
            !dev && new MiniCssExtractPlugin({
                filename: minimize ? '[name].min.css' : '[name].css',
            }),
        ].filter(Boolean),
        devtool: dev && 'inline-source-map',
        optimization: {
            minimize,
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        output: {
                            ascii_only: true,
                        },
                    },
                }),
            ],
        },
        performance: {
            hints: false,
        },
    };
}

module.exports = {
    targets,
    createConfig,
};
