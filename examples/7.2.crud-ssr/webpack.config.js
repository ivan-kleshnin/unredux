let MiniCssExtractPlugin = require("mini-css-extract-plugin")
let Path = require("path")
let Webpack = require("webpack")

module.exports = {
  mode: "development",
  devtool: "eval",
  target: "web",

  entry: {
    bundle: "./client/index.js",
  },
  output: {
    path: Path.resolve("public"),
    filename: "[name].js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
        },
        exclude: /node_modules/
      },
      {
        test: /\.css|less$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "less-loader",
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]",
          }
        }]
      },
    ],
  },
  resolve: {
    alias: {
      path: "path-webpack", // fix broken Webpack polyfill
    },

    modules: [
      Path.resolve(__dirname, "./node_modules"),
      Path.resolve(__dirname, "../../vendors"),
      Path.resolve(__dirname, "../../node_modules"),
    ],
  },

  watchOptions: {
    ignored: /node_modules/
  },

  plugins: [
    new Webpack.ProvidePlugin({
      "R": "@paqmind/ramda",
    }),
    new Webpack.DefinePlugin({
      // Disable "React DevTools Download" console log
      // https://github.com/facebook/react/issues/3877
      "__REACT_DEVTOOLS_GLOBAL_HOOK__": "({ isDisabled: true })"
    }),
     new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].chunk.css",
    }),
  ],
}
