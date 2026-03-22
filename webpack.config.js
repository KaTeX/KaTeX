// @ts-check
const {targets, createConfig} = require('./webpack.common');

/** @type {Array<object>} */
module.exports = ([ //                            dev   minify
    ...targets.map(target => createConfig(target, false, false)),
    ...targets.map(target => createConfig(target, false, true)),
]);
