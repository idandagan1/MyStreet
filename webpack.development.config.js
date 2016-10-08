var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: [
        'webpack-dev-server/client?http://localhost:8000/',
        './client/entry.js',
    ],

    output: {
        filename: 'application.js',
        path: path.join(__dirname, '/dist'),
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'MyStreet',
            filename: 'index.html',
            template: './client/index.html',
        }),
    ],

    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react', 'stage-0'],
                },
            },
            {
                loader: 'style!css!sass?' + 'includePaths[]=' + (path.resolve(__dirname, './node_modules')),
                test: /\.scss$/i,
            },
        ],
    },

    devtool: 'source-map',
};
