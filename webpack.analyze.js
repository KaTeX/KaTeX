// @flow
const {targets, createConfig} = require('./webpack.common');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

//                                                dev   minify
const katexConfig = createConfig(targets.shift(), false, false);

katexConfig.plugins.push(new BundleAnalyzerPlugin());

module.exports = [
    katexConfig,
];
