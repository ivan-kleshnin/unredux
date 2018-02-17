import * as R from "@paqmind/ramda"
import Express from "express"
import {Router as _Router} from "express"

export default Express

export let unless = (paths, middleware) => {
  return (req, res, next) => {
    if (R.find(path => R.startsWith(path, req.path), paths)) {
      return next()
    } else {
      return middleware(req, res, next)
    }
  }
}

export let Router = (...args) => {
  let router = _Router(...args)

  router.param("ids", (req, res, next, val) => {
    if (R.is(String, val)) {
      req.params.ids = R.split(",", val)
    }
    next()
  })

  router.param("fields", (req, res, next, val) => {
    if (R.is(String, val)) {
      req.params.fields = R.split(",", val)
    }
    next()
  })

  return router
}
