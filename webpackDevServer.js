/* eslint no-console:0 */

const WebpackDevServer = require("webpack-dev-server");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");
const PORT = 7936;

webpackConfig.compilerConfig.forEach((config) => {
    config.entry.unshift(`webpack-dev-server/client?http://localhost:${PORT}/`);
});
const compiler = webpack(webpackConfig.compilerConfig);
const server = new WebpackDevServer(compiler, webpackConfig.devServerConfig);

server.listen(PORT);
console.log(`Serving on http://localhost:${PORT}/ ...`);
