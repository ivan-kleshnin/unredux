// Ignore assets in SSR
import * as R from "@paqmind/ramda"
import Express from "express"
import ignoreAssets from "ignore-styles"
import React from "react"
import {layout200} from "./layout"

// CLIENT
// Note: simplified; good SSR happens in a separate process and never crashes the main server
import {seed} from "client/root"
import {appKey} from "client/meta"
//

ignoreAssets([".less", ".css", ".jpg", ".jpeg", ".png", ".gif", ".svg"])

let router = Express.Router()

router.get("/*", (req, res, next) => {
  res.send(layout200({
    appKey,
    appHTML: "",
    state: R.merge(seed, {url: req.originalUrl}),
  }))
})

export default router
