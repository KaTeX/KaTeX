// @flow
const path = require('path');
// $FlowIgnore
const TerserPlugin = require('terser-webpack-plugin');
// $FlowIgnore
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const {version} = require("./package.json");

// $FlowIgnore
const browserslist = require('browserslist')();
// $FlowIgnore
const caniuse = require('caniuse-lite');

// from the least supported to the most supported
const fonts = ['woff2', 'woff', 'ttf'];

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
        name: 'contrib/mhchem',
        entry: './contrib/mhchem/mhchem.js',
    },
    {
        name: 'contrib/copy-tex',
        entry: './contrib/copy-tex/copy-tex.webpack.js',
    },
    {
        name: 'contrib/mathtex-script-type',
        entry: './contrib/mathtex-script-type/mathtex-script-type.js',
    },
    {
        name: 'contrib/render-a11y-string',
        entry: './contrib/render-a11y-string/render-a11y-string.js',
    },
];

/**
 * Create a webpack config for given target
 */
function createConfig(target /*: Target */, dev /*: boolean */,
        minimize /*: boolean */) /*: Object */ {
    const cssLoaders /*: Array<Object> */ = [{
        loader: 'css-loader',
        options: {importLoaders: 1},
    }, {
        loader: 'postcss-loader',
        // $FlowIgnore
        options: {postcssOptions: {plugins: [require('postcss-preset-env')()]}},
    }];
    if (minimize) {
        // $FlowIgnore
        cssLoaders[1].options.postcssOptions.plugins.push(require('cssnano')());
    }

    const lessOptions = {modifyVars: {
        version: `"${version}"`,
    }};

    // use only necessary fonts, overridable by environment variables
    let isCovered = false;
    for (const font of fonts) {
        const override = process.env[`USE_${font.toUpperCase()}`];
        const useFont = override === "true" || override !== "false" && !isCovered;
        lessOptions.modifyVars[`use-${font}`] = useFont;

        const support = caniuse.feature(caniuse.features[font]).stats;
        isCovered = isCovered || useFont && browserslist.every(browser => {
            const [name, version] = browser.split(' ');
            return !support[name] || support[name][version] === 'y';
        });
    }

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
            // Enable output modules to be used in browser or Node.
            // See: https://github.com/webpack/webpack/issues/6522
            // https://github.com/webpack/webpack/pull/11987
            globalObject: "(typeof self !== 'undefined' ? self : this)",
            path: path.resolve(__dirname, 'dist'),
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
                        ...cssLoaders,
                    ],
                },
                {
                    test: /\.less$/,
                    use: [
                        dev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        ...cssLoaders,
                        {
                            loader: 'less-loader',
                            options: {lessOptions},
                        },
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
                new TerserPlugin({
                    terserOptions: {
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
        stats: {
            colors: true,
        },
    };
}

module.exports = {
    targets,
    createConfig,
};
