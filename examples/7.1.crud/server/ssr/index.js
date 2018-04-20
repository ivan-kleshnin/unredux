import Express from "express"
import React from "react"
import {APP_KEY} from "client/meta"
import {appLayout} from "./layout"

let router = Express.Router()

router.get("/*", (req, res, next) => {
  res.send(appLayout({
    appKey: APP_KEY,
    appHTML: "",
  }))
})

export default router
