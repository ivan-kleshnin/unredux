let Path = require("path")

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
  }
}
