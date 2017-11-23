import Express from "express"
import {Router as _Router} from "express"
import * as R from "ramda"

export default Express

export let unless = (path, middleware) => {
  return (req, res, next) => {
    if (req.path.startsWith(path)) {
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
