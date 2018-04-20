let Webpack = require("webpack")
let Path = require("path")

module.exports = {
  devtool: "eval",
  target: "web",

  entry: {
    app: `./src/index.js`,
  },
  output: {
    pathinfo: true,
    filename: 'js/[name].js',
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
    ],
  },
  resolve: {
    modules: [
      Path.resolve(__dirname, "./node_modules"),
      Path.resolve(__dirname, "../../vendors"),
      Path.resolve(__dirname, "../../node_modules"),
    ],
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
