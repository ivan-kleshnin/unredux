// Ignore assets in SSR
import * as R from "@paqmind/ramda"
import Express from "express"
import * as F from "framework"
import ignoreAssets from "ignore-styles"
import K from "kefir"
import React from "react"
import ReactDOMServer from "react-dom/server"
import {layout200} from "./layout"

// CLIENT
// Note: simplified; good SSR happens in a separate process and never crashes the main server
import app, {seed} from "client/root"
import {appKey} from "client/meta"
//

ignoreAssets([".less", ".css", ".jpg", ".jpeg", ".png", ".gif", ".svg"])

let router = Express.Router()

let timeoutError = (delayMs) =>
  K.later(delayMs, K.constantError(new Error("timeout"))).flatMap()

router.get("/*", (req, res, next) => {
  /*if (req.query.noAPP) { TODO special layout, useful for debugging as SSR can be a PITA to test
    res.send(layout200cut({
      appHTML: "",
      state: {},
      project,
    }))
  } else*/ if (req.query.noSSR) {
    let {seed} = require("client/root")

    res.send(layout200({
      appHTML: "",
      state: R.merge(seed, {url: req.originalUrl}),
    }))
  } else {
    let sources = {
      state$: K.pool(),
      DOM: F.fromDOMEvent("#" + appKey),
    }

    let sinks = app(
      R.over2("state$", x => x.toProperty().skipDuplicates(R.equals), sources),
      appKey
    )

    sources.state$.plug(K.constant(R.merge(seed, {url: req.originalUrl})))

    sinks.state$.observe(state => {
      sources.state$.plug(K.constant(state))
    })

    sinks.state$
      .throttle(10)
      .skipDuplicates(R.equals)
      .skipWhile(s => R.any(Boolean, R.values(s._loading)))
      .merge(timeoutError(500))
      .take(1)
      .takeErrors(1)
      .observe(state => {
        let appHTML = ReactDOMServer.renderToString(<sinks.Component/>)
        res.send(layout200({appKey, appHTML, state}))
      }, next)
  }
})

export default router
