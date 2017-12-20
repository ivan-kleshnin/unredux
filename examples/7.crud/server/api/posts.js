import * as R from "ramda"
import {Router} from "../express"
import {makeId} from "common/helpers"
import {makeFilterFn, makeSortFn} from "common/home"
import * as T from "common/types"
import db from "../db.json"

let router = Router()
export default router

// GET posts by filters, sort and pagination =======================================================
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

    let filterFn = makeFilterFn(R.firstOk([query.filters && JSON.parse(query.filters), {}]))
    let sortFn = makeSortFn(R.firstOk([query.sort, "+id"]))
    let offset = R.firstOk([params.offset, query.offset, 0])
    let limit = Math.min(R.firstOk([params.limit, query.limit, 20]), 100)
    let fields = R.firstOk([params.fields, query.fields, null])

    let models = R.pipe(
      R.values,
      R.filter(filterFn),
      R.sort(sortFn),
    )(db.posts)

    let paginatedModels = R.pipe(
      R.slice(offset, offset + limit),
      fields
        ? R.map(R.pick(fields))
        : R.id,
    )(models)

    res.json({
      models: paginatedModels,
      total: models.length,
    })
  }
)

// GET post(s) by id(s) ============================================================================
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
    )(db.posts)

    res.json({models})
  }
)

// CREATE post =====================================================================================
router.post(
  "/",
  (req, res) => {
    let form = req.body
    let post = T.Post(R.merge(form, {
      id: makeId(),
      // TODO other server-only fields
    }))
    db.posts[post.id] = post // TODO persistence
    res.status(201).json({model: post})
  }
)
