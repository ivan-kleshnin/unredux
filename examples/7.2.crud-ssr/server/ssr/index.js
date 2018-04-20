import Express from "express"
import {fromDOMEvent, poolProp} from "framework"
import ignoreAssets from "ignore-styles"
import K from "kefir"
import React from "react"
import ReactDOMServer from "react-dom/server"
import app from "client/root"
import {APP_KEY} from "client/meta"
import {appLayout} from "./layout"

ignoreAssets([".less", ".css", ".jpg", ".jpeg", ".png", ".gif", ".svg"])

let router = Express.Router()

let timeoutError = (delayMs) =>
  K.later(delayMs, K.constantError(new Error("timeout"))).flatMap()

let hasLoadingApps = (state) =>
  R.any(Boolean, R.values(state._loading))

router.get("/*", (req, res, next) => {
  if (req.query.noSSR) {
    res.send(appLayout({
      appKey: APP_KEY,
      appHTML: "",
      state: {},
    }))
  }
  else {
    // Note: simplified, perfect SSR happens in a separate process
    // Prepare sources
    let sources = {
      DOM: fromDOMEvent("#" + APP_KEY),
      state$: poolProp(),
    }

    // Prepare props
    let props = {
      key: APP_KEY,
      url: req.originalUrl,
    }

    // Run app to get sinks
    let sinks = app(sources, props)

    let finalState$ = sinks.state$
      .throttle(50)
      .skipDuplicates(R.equals)
      .skipWhile(hasLoadingApps)
      .delay(1) // wait for sync updates to finish
      .merge(timeoutError(500))
      .take(1)
      .takeErrors(1)
      .toProperty()

    sinks.state$
      .takeUntilBy(finalState$)
      .observe(sources.state$.plug)

    finalState$.observe(state => {
      if (state.document.title == "Not Found") { // TODO better approach
        next() // fallback to 404
      }
      else {
        res.send(appLayout({
          appKey: APP_KEY,
          appHTML: ReactDOMServer.renderToString(<sinks.Component/>),
          state: state,
        }))
      }
    }, next) // error handler is the same
  }
})

export default router
