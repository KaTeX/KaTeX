const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

const {version} = require("./package.json");

const browserslist = require('browserslist')();
const caniuse = require('caniuse-lite');

// from the least supported to the most supported
const fonts = ['woff2', 'woff', 'ttf'];

/**
 * List of targets to build
 */
const targets = [
    {
        name: 'katex',
        entry: './katex.webpack.js',
        library: 'katex',
    },
    {
        name: 'katex-swap',
        entry: './src/styles/katex-swap.scss',
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
        entry: './contrib/copy-tex/copy-tex.ts',
    },
    {
        name: 'contrib/mathtex-script-type',
        entry: './contrib/mathtex-script-type/mathtex-script-type.js',
    },
    {
        name: 'contrib/render-a11y-string',
        entry: './contrib/render-a11y-string/render-a11y-string.ts',
    },
];

/**
 * Create a webpack config for given target
 */
function createConfig(target, dev, minimize) {
    const cssLoaders = [{
        loader: 'css-loader',
        options: {importLoaders: 1},
    }, {
        loader: 'postcss-loader',
        options: {postcssOptions: {plugins: [require('postcss-preset-env')()]}},
    }];
    if (minimize) {
        cssLoaders[1].options.postcssOptions.plugins.push(require('cssnano')());
    }

    let sassVariables = `$version: "${version}";\n`;

    // use only necessary fonts, overridable by environment variables
    let isCovered = false;
    for (const font of fonts) {
        const override = process.env[`USE_${font.toUpperCase()}`];
        const useFont = override === "true" || override !== "false" && !isCovered;
        sassVariables += (`$use-${font}: ${useFont.toString()};\n`);

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
                    test: /\.ts?$/,
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
                    test: /\.scss$/,
                    use: [
                        dev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        ...cssLoaders,
                        {
                            loader: 'sass-loader',
                            options: {
                                sassOptions: {
                                    style: 'expanded',
                                },
                                additionalData: sassVariables,
                            },
                        },
                    ],
                },
                {
                    test: /\.(ttf|woff|woff2)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name][ext][query]',
                    },
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        externals: 'katex',
        plugins: [
            !dev && new RemoveEmptyScriptsPlugin(),
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
