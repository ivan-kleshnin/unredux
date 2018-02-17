let ExtractTextPlugin = require("extract-text-webpack-plugin")
let Fs = require("fs")
let Path = require("path")
let Webpack = require("webpack")

let configs = {
  devtool: "eval",
  entry: {
    bundle: "./client/index.js",
  },
  output: {
    pathinfo: true,
    filename: "[name].js",
    path: Path.resolve("public"),
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(less(\?.*)?)$/,
        use: ExtractTextPlugin.extract({
          use: ["css-loader", "less-loader"]
        }),
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]",
            publicPath: Path.resolve("public"),
            context: Path.resolve("client"),
          }
        }]
      },
    ],
  },
  target: "web",
  resolve: {
    modules: [
      Path.resolve(__dirname, "node_modules"),
      Path.resolve(__dirname, "../../vendors"),
      Path.resolve(__dirname, "../../node_modules"),
    ],
  },
  plugins: [
    new ExtractTextPlugin("[name].css"),
    new Webpack.DefinePlugin({
      // Disable "React DevTools Download" console log
      // https://github.com/facebook/react/issues/3877
      "__REACT_DEVTOOLS_GLOBAL_HOOK__": "({ isDisabled: true })"
    }),
  ],
}

module.exports = configs
