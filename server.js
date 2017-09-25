const WebpackDevServer = require("webpack-dev-server");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");
const PORT = 7936;


const compiler = webpack(webpackConfig.compilerConfig);
const server = new WebpackDevServer(compiler, webpackConfig.devServerConfig);

server.listen(PORT);
