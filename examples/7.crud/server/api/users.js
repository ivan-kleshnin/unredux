import * as R from "@paqmind/ramda"
import {makeId} from "common/helpers"
import {makeFilterFn, makeSortFn} from "common/home"
import * as T from "common/types"
import {Router} from "../express"
import db from "../db.json"

let router = Router({
  caseSensitive: true,
  strict: true
})

export default router

// Get users by filter, sort and pagination ========================================================
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
    )(db.users)

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

// Get user(s) by id(s) ============================================================================
router.get(
  [
    "/:ids/",
    "/:ids/:fields/",
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

    res.json({models})
  }
)

// Create user =====================================================================================
router.post(
  "/",
  (req, res) => {
    let form = req.body
    let user
    try {
      user = T.User({
        id: makeId(),
        fullname: form.fullname,
        // TODO ...
      })
    } catch (err) {
      return res.status(400).json({error: err.message})
    }
    db.users[user.id] = user // TODO persistence
    res.status(201).json({model: user})
  }
)

// Edit user =======================================================================================
// TODO
