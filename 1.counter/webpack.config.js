let Path = require("path")

let folder = JSON.parse(process.env.npm_config_argv).original[1]

module.exports = {
  devtool: "eval",

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
      {test: /\.js$/, use: "babel-loader", exclude: /node_modules/},
    ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
  }
}
