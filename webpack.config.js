const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const CompressionPlugin = require("compression-webpack-plugin");

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
    hot: true,
    contentBase: path.resolve(__dirname, 'dist'),
    watchContentBase: true,
    port: 4000,
  },
  module: {
    rules: [
      {
        test: /\.scss|css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!sass-loader',
        }),
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
    new ExtractTextPlugin('../css/style.css'),
    // new CompressionPlugin({test: /\.js/})
  ],
};
