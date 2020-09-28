// @flow
const {targets, createConfig} = require('./webpack.common');
// $FlowIgnore
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

//                                                              dev   minify
const katexConfig /*: Object */ = createConfig(targets.shift(), false, false);

katexConfig.plugins.push(new BundleAnalyzerPlugin());

module.exports = [
    katexConfig,
];
