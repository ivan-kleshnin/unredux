import Express from "express"
import ignoreAssets from "ignore-styles"
import K from "kefir"
import React from "react"
import ReactDOMServer from "react-dom/server"
import {fromDOMEvent, poolProp} from "vendors/framework"
import clientApp, {seed as clientSeed} from "client/root"
import {APP_KEY} from "client/meta"
import {appLayout} from "./templates"

ignoreAssets([".less", ".css", ".jpg", ".jpeg", ".png", ".gif", ".svg"])

let router = Express.Router()

let timeoutError = (delayMs) =>
  K.later(delayMs, K.constantError(new Error("timeout"))).flatMap()

let hasLoadingApps = (state) =>
  R.any(Boolean, R.values(state._loading))

router.get("/*", (req, res, next) => {
  let canonicalUrl = `${req.protocol}://${global.host}${req.originalUrl}`

  // SSR
  if ("noSSR" in req.query) {
    return res.send(appLayout({
      appKey: APP_KEY,
      appHTML: "",
      state: clientSeed,
      url: canonicalUrl,
    }))
  } else {
    // Note: simplified, perfect SSR happens in a separate process
    // Prepare sources
    let sources = {
      DOM: fromDOMEvent("#" + APP_KEY),
      state$: poolProp(clientSeed),
    }

    // Prepare props
    let props = {
      key: APP_KEY,
      url: req.originalUrl,
    }

    // Run clientApp to get sinks
    let sinks = clientApp(sources, props)

    let finalState$ = K.fromProperty(sinks.state$)
      .skipWhile(hasLoadingApps)
      .debounce(50) // necessary to wait for sync events to finish, DO NOT remove
      .merge(timeoutError(3000))
      .take(1)
      .takeErrors(1)

    sinks.state$.observe(sources.state$.plug)

    return finalState$.observe(state => {
      res.status(state.document.title == "Not Found" ? 404 : 200)
      res.send(appLayout({
        appKey: APP_KEY,
        appHTML: ReactDOMServer.renderToString(<sinks.Component/>),
        url: canonicalUrl,
        state,
      }))
    }, next)
  }
})

export default router
