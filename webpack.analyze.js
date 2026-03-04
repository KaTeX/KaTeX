// @ts-check
const {targets, createConfig} = require('./webpack.common');
// @ts-ignore
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

//                                                              dev   minify
const target = targets.shift();
if (!target) {
    throw new Error("No webpack targets defined");
}
/** @type {any} */
const katexConfig = createConfig(target, false, false);

katexConfig.plugins.push(new BundleAnalyzerPlugin());

/** @type {Array<object>} */
module.exports = [
    katexConfig,
];
