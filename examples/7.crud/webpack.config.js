let ExtractTextPlugin = require("extract-text-webpack-plugin")
let Fs = require("fs")
let Path = require("path")
let Webpack = require("webpack")

// === DO NOT USE RAMDA HERE ("ramda" is fake, non-ES6 vendor, see postinstall.sh) ===

let configs = {
  devtool: "eval",
  entry: {
    app: "./client/index.js",
  },
  output: {
    pathinfo: true,
    filename: "js/[name].js",
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
    ],
  },
  target: "web",
  node: {
    fs: "empty" // TODO: think how can it be avoided (if it should be)
  },
  resolve: {
    modules: [
      Path.resolve(__dirname, "node_modules"),
      Path.resolve(Path.resolve(__dirname, "../../vendors")),
      Path.resolve(Path.resolve(__dirname, "../../node_modules")),
    ],
  },
  plugins: [
    new ExtractTextPlugin("css/[name].css"),
  ],
}

module.exports = configs
