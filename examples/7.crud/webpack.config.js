let Fs = require("fs")
let Path = require("path")
let Webpack = require("webpack")

// === DO NOT USE RAMDA HERE ("ramda" is fake, non-ES6 vendor, see postinstall.sh) ===

let commonConfigs = {
  module: {
    rules: [
      {test: /\.js$/, use: "babel-loader", exclude: /node_modules/},
    ]
  },
}

let frontendConfigs = {
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
  target: "web",
  node: {
    fs: "empty" // TODO: think if I can/should avoid it
  },
  resolve: {
    modules: [
      Path.resolve(__dirname, "node_modules"),
      Path.resolve(Path.resolve(__dirname, "../../vendors")),
      Path.resolve(Path.resolve(__dirname, "../../node_modules")),
    ],
  },
  plugins: [
    new Webpack.DefinePlugin({
      // Disable "React DevTools Download" console log
      // https://github.com/facebook/react/issues/3877
      "__REACT_DEVTOOLS_GLOBAL_HOOK__": "({ isDisabled: true })"
    }),
  ],
}

// Article about configuring Webpack for backend:
// http://jlongster.com/Backend-Apps-with-Webpack--Part-I
// let backendConfigs = {
//   devtool: "sourcemap",
//   entry: {
//     server: "./server/index.js",
//   },
//   output: {
//     filename: "[name].js",
//     path: Path.resolve("build"),
//   },
//   target: "node",
//   externals: Fs.readdirSync("node_modules").reduce((memo, module) => {
//     return R.indexOf(".bin", module) === -1
//       ? R.assoc(module,  "commonjs " + module, memo)
//       : memo
//   }, {}),
//   plugins: [
//     new Webpack.IgnorePlugin(/\.(css|less|png|jpg)$/),
//     new Webpack.BannerPlugin({
//       banner: "require(\"source-map-support\").install();",
//       raw: true,
//       entryOnly: false
//     }),
//   ],
// }

module.exports = Object.assign({}, frontendConfigs, commonConfigs) // ,
  // R.merge(backendConfigs, commonConfigs), // TODO __dirname and __filename don't work after packing
// ]
