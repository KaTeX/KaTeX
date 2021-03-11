// @flow
const {targets, createConfig} = require('./webpack.common');
const path = require('path');
const PORT = 7936;

//                                                             dev   minify
const katexConfig /*: Object*/ = createConfig(targets.shift(), true, false);

// add the entry point for test page
katexConfig.entry.main = './static/main.js';

// only the `devServer` options for the first configuration will be taken
// into account and used for all the configurations in the array.
katexConfig.devServer = {
    static: [
        path.join(__dirname, 'static'),
        {
            directory: __dirname,
            watch: false,
        },
    ],
    // Allow server to be accessed from anywhere, which is useful for
    // testing.  This potentially reveals the source code to the world,
    // but this should not be a concern for testing open-source software.
    firewall: false,
    host: '0.0.0.0',
    port: PORT,
};

module.exports = ([
    katexConfig,
    ...targets.map(target => createConfig(target, true, false)),
] /*: Array<Object> */);
