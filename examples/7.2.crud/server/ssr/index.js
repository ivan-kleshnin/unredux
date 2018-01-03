// Ignore assets in SSR
import ignoreAssets from "ignore-styles"
ignoreAssets([".less", ".css", ".jpg", ".jpeg", ".png", ".gif", ".svg"])

import Express from "express"
import * as F from "framework"
import K from "kefir"
import P from "path"
import * as R from "ramda"
import React from "react"
import ReactDOMServer from "react-dom/server"
import {layout200} from "./layout"

let router = Express.Router()

router.get("/*", (req, res, next) => {
  try {
    // Dynamic imports
    let app = require("client/root").default
    let {seed} = require("client/root")
    let {APP_KEY} = require("client/meta")

    // With SSR
    let sources = {
      state$: K.pool(),
      DOM: F.fromDOMEvent("#" + APP_KEY),
    }

    let sinks = app(
      R.over("state$", x => x.toProperty(), sources),
      APP_KEY
    )

    sources.state$.plug(K.constant(R.merge(seed, {url: req.originalUrl})))

    sinks.state$.observe(state => {
      sources.state$.plug(K.constant(state))
    })

    sinks.state$
      .skip(1)                                     // skip initial state
      .merge(K.later(500, sinks.state$).flatMap()) // timeout 500
      .take(1)                                     // a state to render
      .takeErrors(1)
      .observe(state => {
        let appHTML = ReactDOMServer.renderToString(<sinks.Component/>)
        res.send(layout200({appHTML, state}))
      }, error => {
        next(error)
      }, () => {
        cleanCache(filename => filename.match(P.join("examples", "7.crud", "client")))
        next()
      })
  } catch (error) {
    return next(error)
  }

  // Without SSR
  // res.send(layout({
  //   appHTML: "",
  //   state: R.merge(seed, {url: req.originalUrl})
  // }))
  // for (let moduleName of ["client/root/index.js", "client/meta.js"]) {
  //   cleanCache(makeMatchFn(moduleName))
  // }
})

export default router

let cleanCache = (matchFn) => {
  Object.keys(require.cache).forEach(module => {
    if (matchFn(require.cache[module].filename)) {
      // console.log(`deleting ${require.cache[module].filename}...`)
      delete require.cache[module]
    }
  })
}
