let Path = require("path")

process.env.NODE_ENV = process.env.NODE_ENV || "development"

let folder = process.argv.slice(-1)[0]

module.exports = {
  devtool: "eval",

  entry: {
    app: `./${folder}/index.js`,
    vendors: `./${folder}/vendors.js`,
  },
  output: {
    pathinfo: true,
    filename: 'js/[name].js',
    path: Path.resolve("public"),
    publicPath: "/",
  },
  module: {
    rules: [
      {test: /\.js$/, use: "babel-loader"},
    ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
  }
}
