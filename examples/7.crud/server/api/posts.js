import {Router} from "express"
import * as R from "../../../../vendors/ramda"
import {splitIds} from "../helpers"
import db from "../db.json"

let router = Router()
export default router

// GET posts by filter, sort and pagination ========================================================
router.get(
  [
    "/",
    "/~/:field/",
    "/:offset~:limit/",
    "/:offset~:limit/:field/",
    "/~:limit/",
    "/~:limit/:field/",
  ],
  (req, res) => {
    let {params, query} = req

    // TODO filterFn, sortFn
    let filterFn = R.id
    let sortFn = R.ascend(R.prop("id"))
    let offset = R.firstOk([params.offset, query.offset, 0])
    let limit = R.firstOk([params.limit, query.limit, 20])
    let field = R.firstOk([params.field, query.field, null])

    let models = R.pipe(
      R.values,
      R.filter(filterFn),
      R.sort(sortFn),
      R.slice(offset, offset + limit),
      field
        ? R.map(R.prop(field))
        : R.id,
    )(db.posts)

    res.json(models)
  }
)

// GET posts by ids ================================================================================
router.get(/\/\d+(,\d+)*/, (req, res) => {
  req.params.ids = splitIds(req.path)
  let {params, query} = req
  let field = R.firstOk([query.field, null])

  let models = R.pipe(
    R.props(params.ids),
    field
      ? R.prop(field)
      : R.id,
  )(db.posts)

  res.json(models)
})

// GET post by id ==================================================================================
router.get("/:id", (req, res) => {
  let {params, query} = req
  let field = R.firstOk([query.field, null])

  let model = R.pipe(
    R.prop(params.id),
    field
      ? R.prop(field)
      : R.id,
  )(db.posts)

  if (model)
    res.json(model)
  else
    res.status(404).end()
})
