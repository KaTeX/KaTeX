// @flow
const { targets, createConfig } = require('./webpack.common');
const path = require('path');
const PORT = 7936;

// only the `devServer` options for the first configuration will be taken
// into account and used for all the configurations in the array.
//                                                dev   minify
const katexConfig = createConfig(targets.shift(), true, false);
katexConfig.devServer = {
    contentBase: [path.join(__dirname, 'static'), __dirname],
    // Allow server to be accessed from anywhere, which is useful for
    // testing.  This potentially reveals the source code to the world,
    // but this should not be a concern for testing open-source software.
    disableHostCheck: true,
    port: PORT,
};

module.exports = [
    katexConfig,
    ...targets.map(target => createConfig(target, true, false)),
];
