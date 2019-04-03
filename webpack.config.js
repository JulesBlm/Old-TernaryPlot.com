const webpack = require('webpack');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  entry: {
    app: './src/js/main.js',
    explain: './src/js/explain.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist/js'),
  },
  devServer: {
    contentBase: path.join(__dirname, '/dist/'),
    watchContentBase: true,
    publicPath: '/dist/js',
    compress: true,
    port: 4004,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      nodePath: path.join(__dirname, 'node_modules'),
    },
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    // Make Reveal a global variable
    new webpack.ProvidePlugin({
      Reveal: 'reveal.js',
    }),
    // Ignore all locale files of moment.js
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // new CompressionPlugin({test: /\.js/})
  ],
};
