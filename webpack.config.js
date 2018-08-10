const webpack = require('webpack');
const path = require('path');

module.exports = {
    devtool: 'inline-source-map',    
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
    plugins: [
        // Ignore all locale files of moment.js
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        // new webpack.ProvidePlugin({Reveal: 'reveal.js',}),
    ],
 // optimization: {
 //    runtimeChunk: false,
 //    splitChunks: {
 //      chunks: 'all'
 //    }
 //  },
};