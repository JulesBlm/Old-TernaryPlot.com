const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
require('dotenv').config();

module.exports = {
  entry: {
    app: './src/js/main.js',
    explain: './src/js/explain.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist/js'),
    publicPath: path.resolve(__dirname, '/js'),
  },
  devtool: 'source-map',
  devServer: {
    liveReload: true,
    contentBase: path.resolve(__dirname, 'dist'),
    watchContentBase: true,
    port: 4000,
  },
  module: {
    rules: [
      {
        test: /\.scss|css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it uses publicPath in webpackOptions.output
              publicPath: '../',
              // hmr: process.env.NODE_ENV === 'development',
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    alias: {
      nodePath: path.join(__dirname, 'node_modules'),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      SENTRY: JSON.stringify(process.env.SENTRY),
    }),
    // Make Reveal a global variable
    new webpack.ProvidePlugin({
      Reveal: 'reveal.js',
    }),
    // Ignore all locale files of moment.js
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new MiniCssExtractPlugin({
      filename: '../css/style.css',
    }),
    // new CompressionPlugin({test: /\.js/})
  ],
};
