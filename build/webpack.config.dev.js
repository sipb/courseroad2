'use strict'
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = (env) => {
  return {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: [
      '@babel/polyfill',
      './src/app.js'
    ],
    devServer: {
      hot: true,
      watchOptions: {
        poll: true
      }
    },
    module: {
      rules: [
        {
          // This rule in webpack checks for font files and copies them to the output directory:
          // - The first section checks for files of type woff, woff2, ttf, eot, svg.
          // - The second part checks for a possible query string indicating version, such as ?v=1.2.3.
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: './fonts',
              publicPath: '../fonts'
            }
          }]
        },
        {
          test: /\.vue$/,
          use: [
            'vue-loader'
          ]
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            'css-loader'
          ]
        },
        {
          exclude: /node_modules/,
          test: /\.js$/,
          use: 'babel-loader'
        }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'index.html',
        inject: true
      }),
      new MiniCssExtractPlugin({
        filename: 'css/app.css'
      }),
      new webpack.DefinePlugin({ 'process.env.APP_URL': JSON.stringify(env.APP_URL) }),
      new webpack.DefinePlugin({ 'process.env.FIREROAD_URL': JSON.stringify(env.FIREROAD_URL) })
    ]
  }
}
