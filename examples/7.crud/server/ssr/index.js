import Express from "express"
import * as F from "framework"
import * as R from "ramda"
import React from "react"
import ReactDOMServer from "react-dom/server"
import {ReplaySubject} from "rxjs"
import app, {seed} from "client/root"
import {APP_KEY} from "client/meta"
import layout from "./layout"

let router = Express.Router()

router.get("/*", (req, res) => {
  // With SSR
  // let sources = {
  //   props: {},
  //   state$: new ReplaySubject(1),
  //   DOM: F.fromDOMEvent("#" + APP_KEY),
  // }
  //
  // let sinks = app(sources, APP_KEY)
  //
  // sinks.state$.subscribe(sources.state$)
  //
  // sources.state$.next(R.merge(seed, {url: req.originalUrl}))
  //
  // sinks.state$
  //   .skip(1)                        // skip initial update
  //   .merge(sinks.state$.delay(500)) // timeout 500
  //   .take(1)                        // ...
  //   .subscribe(state => {
  //     let appHTML = ReactDOMServer.renderToString(<sinks.Component/>)
  //     res.send(layout({appHTML, state}))
  //   })

  // Without SSR
  res.send(layout({
    appHTML: "",
    state: R.merge(seed, {url: req.originalUrl})
  }))
})

export default router
