import Express from "express"
import * as F from "framework"
import K from "kefir"
import * as R from "ramda"
import React from "react"
import ReactDOMServer from "react-dom/server"
import app, {seed} from "client/root"
import {APP_KEY} from "client/meta"
import layout from "./layout"

let router = Express.Router()

router.get("/*", (req, res) => {
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
    .skip(1)                                     // skip initial update
    .merge(K.later(500, sinks.state$).flatMap()) // timeout 500
    .take(1)                                     // a state to render
    .observe(state => {
      let appHTML = ReactDOMServer.renderToString(<sinks.Component/>)
      res.send(layout({appHTML, state}))
    })

  // Without SSR
  // res.send(layout({
  //   appHTML: "",
  //   state: R.merge(seed, {url: req.originalUrl})
  // }))
})

export default router
