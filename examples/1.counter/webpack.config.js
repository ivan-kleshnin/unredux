let Path = require("path")
let Webpack = require("webpack")

module.exports = {
  mode: "development",
  devtool: "eval",
  target: "web",
  entry: {
    app: `./src/index.js`,
  },
  output: {
    path: Path.resolve("public"),
    filename: "js/[name].js",
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
  ],
}
