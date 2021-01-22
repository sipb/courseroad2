'use strict'
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const { resolve } = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cgi = require('cgi')

module.exports = (env) => {
  return {
    devtool: 'eval-source-map',
    entry: [
      '@babel/polyfill',
      './src/app.js'
    ],
    devServer: {
      historyApiFallback: true,
      hot: true,
      watchOptions: {
        poll: true
      },
      before: function (app, server, compiler) {
        // Before handing all other dev server requests, check if the route is to the People API middleware and pass
        // it to the CGI handler.
        app.get('/cgi-bin/people.py', function (req, res) {
          cgi(resolve(__dirname, '..', 'cgi-bin', 'people.py'))(req, res)
        })
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
    output: {
      publicPath: env.VUE_APP_URL.indexOf('dev') !== -1 ? '/dev/' : '/'
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
      new webpack.DefinePlugin({ 'process.env.VUE_APP_URL': JSON.stringify(env.VUE_APP_URL) }),
      new webpack.DefinePlugin({ 'process.env.VUE_APP_FIREROAD_URL': JSON.stringify(env.VUE_APP_FIREROAD_URL) })
    ]
  }
}
