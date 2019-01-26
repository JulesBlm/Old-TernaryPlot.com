const webpack = require('webpack');
const path = require('path');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    entry: {
       app: './src/js/main.js',
       explain: './src/js/explain.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist/js')
    },
    // optimization: {
    //     splitChunks: {
    //       chunks: 'all'
    //     }
    // },   
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
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
        // new BundleAnalyzerPlugin(),
        // new CompressionPlugin({test: /\.js/})
    ],
};