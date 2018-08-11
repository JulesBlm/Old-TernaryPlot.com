const webpack = require('webpack');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    entry: {
       app: './src/js/main.js',
       explain: './src/js/explain.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist/js')
    },
    module:{
        rules:[
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            }
        ]
    },
    resolve: {
      alias: {
        nodePath: path.join(__dirname, 'node_modules'),
      }
    },    
    plugins: [
        // Ignore all locale files of moment.js
        new webpack.ProvidePlugin({
          Reveal: 'reveal.js',
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new UglifyJsPlugin({
            uglifyOptions: {
              ecma: 8,
              warnings: false,
              mangle: false,
              output: {
                comments: false,
                beautify: false,
              },
              toplevel: false,
              nameCache: null,
              ie8: false,
              keep_classnames: true,
              keep_fnames: true,
              safari10: false,
            }
        }),
        new BundleAnalyzerPlugin(),
        // new CompressionPlugin({test: /\.js/})
    ],
};