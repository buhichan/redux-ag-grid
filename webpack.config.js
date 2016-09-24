/**
 * Created by YS on 2016/8/26.
 */
"use strict";

require('es6-promise').polyfill();

var webpack = require("webpack");
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var ENV = process.env.npm_lifecycle_event;

var config = {
    entry: {"formly-form-preset":["./index"]},
    output: {
        path:  __dirname +"/dist",
        publicPath: "/",
        filename: ENV == 'build:prod' ? "[name].min.js" : "[name].js",
        chunkFilename: ENV=='dev' ? '[name].[hash].js' : '[name].js'
    },
    module: {
        loaders: [{
            test: /.jsx?$/,
            loader: "babel",
            exclude: /node_modules/
        },{
            test: /.css$/,
            loader: ExtractTextPlugin.extract('style', 'css?sourceMap&-url!postcss')
        },{
            test: /.html$/,
            loader: 'raw'
        }]
    },
    plugins: [
        new ExtractTextPlugin('[name].css')
    ],
    devServer:{
        contentBase: '.',
        stats:'minimal'
    },
    resolve:{
        modulesDirectories:['node_modules']
    },
    externals:{
        angular:"angular"
    }
};

if(ENV=='dev')
    config.plugins.push(
        new HtmlWebpackPlugin({
            template: './example/index.html',
            inject: 'body'
        })
    );
if(ENV == 'build:prod')
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());

switch(ENV){
    case "dev":
        config.devtools= 'inline-source-map';break;
    case "build:dev":
        config.devtools = 'eval-source-map';break;
    case "build:prod":
        config.devtools = 'source-map';break;
}

module.exports = config;