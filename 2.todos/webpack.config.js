let Path = require("path")

let folder = JSON.parse(process.env.npm_config_argv).original[1]

module.exports = {
  devtool: "eval",

  entry: {
    app: `./${folder}/index.js`,
    vendors: `../common/vendors.js`,
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
