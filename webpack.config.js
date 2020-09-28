// @flow
const {targets, createConfig} = require('./webpack.common');

module.exports = ([ //                            dev   minify
    ...targets.map(target => createConfig(target, false, false)),
    ...targets.map(target => createConfig(target, false, true)),
] /*: Array<Object> */);
