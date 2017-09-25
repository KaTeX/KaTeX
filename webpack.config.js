const path = require('path');

const katexConfig = {
  entry: ['webpack-dev-server/client?http://localhost:7936/', './katex.js'],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'katex.js',
    publicPath: '/build/',
    library: 'katex',
    libraryTarget: 'umd',
    libraryExport: 'default',
  }
};

const copyTexConfig = {
  entry: ['webpack-dev-server/client?http://localhost:7936/', './contrib/copy-tex/copy-tex.js'],
  output: {
    path: path.join(__dirname, 'build', 'contrib', 'copy-tex'),
    filename: 'copy-tex.js',
    publicPath: '/build/',
  },
};

const autoRenderConfig = {
  entry: ['webpack-dev-server/client?http://localhost:7936/', './contrib/auto-render/auto-render.js'],
  output: {
    path: path.join(__dirname, 'build', 'contrib', 'auto-render'),
    filename: 'auto-render.js',
    publicPath: '/build/',
    library: 'renderMathInElement',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
};

const commonConfig = {
  module: {
      rules: [
          {
              test: /\.js$/,
              use: 'babel-loader',
              exclude: /node_modules\//,
          },
      ],
  },
  devServer: {
      publicPath: '/',
      contentBase: path.join(__dirname, 'build'),
      stats: {
        colors: true,
      },
  },
  devtool: 'eval-source-map',
};

module.exports = {
  compilerConfig: [
    Object.assign({}, katexConfig, commonConfig),
    Object.assign({}, copyTexConfig, commonConfig),
    Object.assign({}, autoRenderConfig, commonConfig),
  ],
  devServerConfig: {
    publicPath: '/',
    contentBase: path.join(__dirname, 'build'),
    stats: {
      colors: true,
    },
    watchOptions: {
      poll: true,
    },
  },
};
