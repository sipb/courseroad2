"use strict";
const webpack = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const { resolve } = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const cgi = require("cgi");
const path = require("path");

module.exports = (env) => {
  return {
    devtool: "eval-source-map",
    entry: ["@babel/polyfill", "./src/app.js"],
    resolve: {
      alias: {
        "@": path.join(__dirname, "..", "src"),
      },
    },
    devServer: {
      historyApiFallback: true,
      hot: true,
      static: {
        watch: true,
      },
      // onBeforeSetupMiddleware: function (devServer) {
      //   // Before handing all other dev server requests, check if the route is to the People API middleware and pass
      //   // it to the CGI handler.
      //   devServer.app.get('/cgi-bin/people.py', function (req, res) {
      //     cgi(resolve(__dirname, '..', 'cgi-bin', 'people.py'))(req, res)
      //   })
      // }
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error("webpack-dev-server is not defined");
        }

        middlewares.unshift({
          name: "handle-people-api",
          path: "/cgi-bin/people.py",
          middleware: (req, res) => {
            cgi(resolve(__dirname, "..", "cgi-bin", "people.py"))(req, res);
          },
        });

        return middlewares;
      },
    },
    module: {
      rules: [
        {
          // This rule in webpack checks for font files and copies them to the output directory:
          // - The first section checks for files of type woff, woff2, ttf, eot, svg.
          // - The second part checks for a possible query string indicating version, such as ?v=1.2.3.
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]",
                outputPath: "./fonts",
                publicPath: "../fonts",
              },
            },
          ],
        },
        {
          test: /\.vue$/,
          use: ["vue-loader"],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            "css-loader",
          ],
        },
        {
          exclude: /node_modules/,
          test: /\.js$/,
          use: "babel-loader",
        },
        {
          test: /\.s(c|a)ss$/,
          use: [
            "vue-style-loader",
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass"),
              },
            },
          ],
        },
      ],
    },
    output: {
      publicPath: env.VUE_APP_URL.indexOf("dev") !== -1 ? "/dev/" : "/",
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "index.html",
        inject: true,
      }),
      new MiniCssExtractPlugin({
        filename: "css/app.css",
      }),
      new webpack.DefinePlugin({
        "process.env.VUE_APP_URL": JSON.stringify(env.VUE_APP_URL),
      }),
      new webpack.DefinePlugin({
        "process.env.VUE_APP_FIREROAD_URL": JSON.stringify(
          env.VUE_APP_FIREROAD_URL,
        ),
      }),
    ],
  };
};
