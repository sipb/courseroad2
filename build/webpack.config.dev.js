'use strict'
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = (env) => {
  return {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: [
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
          test: /\.vue$/,
          use: [
            'vue-loader'
          ]
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader'
          ],
        },
        {
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
      new webpack.DefinePlugin({ 'process.env.APP_URL': JSON.stringify(env.APP_URL) }),
      new webpack.DefinePlugin({ 'process.env.FIREROAD_URL': JSON.stringify(env.FIREROAD_URL) })
    ]
  }
}
