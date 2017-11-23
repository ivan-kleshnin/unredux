import {Router} from "../express"
import * as R from "ramda"
import db from "../db.json"

let router = Router()
export default router

// GET users by filter, sort and pagination ========================================================
router.get(
  [
    "/",
    "/~/:fields/",
    "/:offset~:limit/",
    "/:offset~:limit/:fields/",
    "/~:limit/",
    "/~:limit/:fields/",
  ],
  (req, res) => {
    let {params, query} = req

    // TODO filterFn, sortFn
    let filterFn = R.id
    let sortFn = R.ascend(R.prop("id"))
    let offset = R.firstOk([params.offset, query.offset, 0])
    let limit = R.firstOk([params.limit, query.limit, 20])
    let fields = R.firstOk([params.fields, query.fields, null])

    let models = R.pipe(
      R.values,
      R.filter(filterFn),
      R.sort(sortFn),
      R.slice(offset, offset + limit),
      fields
        ? R.map(R.pick(fields))
        : R.id,
    )(db.users)

    res.json({data: models})
  }
)

// GET user(s) by id(s) ============================================================================
router.get(
  [
    "/:ids",
    "/:ids/:fields",
  ],
  (req, res) => {
    let {params, query} = req
    let fields = R.firstOk([params.fields, query.fields, null])

    let models = R.pipe(
      R.pick(params.ids),
      fields
        ? R.map(R.pick(fields))
        : R.id,
    )(db.users)

    res.json({data: models})
  }
)
