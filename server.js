const WebpackDevServer = require("webpack-dev-server");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");
const PORT = 7936;


const compiler = webpack(webpackConfig);
const server = new WebpackDevServer(compiler, {
    stats: { colors: true },
});

server.listen(PORT);
