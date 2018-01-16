// @flow
const { targets, createConfig } = require('./webpack.common');

module.exports = targets.reduce((configs, target) => {
    configs.push(createConfig(target, false, false));
    configs.push(createConfig(target, false, true));
    return configs;
}, []);
