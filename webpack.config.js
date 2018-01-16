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
        name: 'auto-render',
        entry: './contrib/auto-render/auto-render.js',
        library: 'renderMathInElement',
    },
    {
        name: 'copy-tex',
        entry: './contrib/copy-tex/copy-tex.js',
    },
    {
        name: 'mathtex-script-type',
        entry: './contrib/mathtex-script-type/mathtex-script-type.js',
    },
];

/**
 * Create a webpack config for given target
 */
function createConfig(target /*: Target */, minimize /*: boolean */) /*: Object */ {
    const cssLoader = {
        loader: 'css-loader',
        options: {
            minimize, // cssnano
        },
    };
    const config = {
        entry: {
            [target.name]: target.entry,
        },
        output: {
            filename: minimize ? '[name].min.js' : '[name].js',
            path: path.resolve(__dirname, target.library === 'katex'
              ? 'build' : 'build/contrib'),
            library: target.library,
            libraryTarget: 'umd',
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
        plugins: [
            new webpack.EnvironmentPlugin({
                NODE_ENV: 'production',
            }),
            new ExtractTextPlugin(minimize ? '[name].min.css' : '[name].css'),
        ],
    };

    if (minimize) {
        config.plugins.push(new UglifyJsPlugin({
            uglifyOptions: {
                output: {
                    ascii_only: true,
                },
            },
        }));
    }

    return config;
}

module.exports = targets.reduce((configs /*: Array<Object> */,
        target /*: Target */) /*: Array<Object> */ => {
    configs.push(createConfig(target, false), createConfig(target, true));
    return configs;
}, []);
