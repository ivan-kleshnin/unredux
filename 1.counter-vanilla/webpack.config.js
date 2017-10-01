let Path = require("path")

module.exports = {
  entry: {
    app: "./client/index.js",
    vendors: "./client/vendors.js",
  },
  output: {
    pathinfo: true,
    filename: 'js/[name].js',
    path: Path.resolve("public"),
    publicPath: "/",
  }
}
