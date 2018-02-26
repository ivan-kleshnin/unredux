import * as R from "@paqmind/ramda"
import {makeFilterFn, makeSortFn} from "common/user-index"
import {Router} from "../express"
import db0 from "../db0.json"
import db1 from "../db1.json"
import db2 from "../db2.json"
import db3 from "../db3.json"
import db4 from "../db4.json"
import db5 from "../db5.json"
import db6 from "../db6.json"
import db7 from "../db7.json"

let db = {0: db0, 1: db1, 2: db2, 3: db3, 4: db4, 5: db5, 6: db6, 7: db7}

let router = Router({
  caseSensitive: true,
  strict: true,
})

export default router

// Get users by filter, sort and pagination ========================================================
router.get(
  [
    "/:subset/users/",
    "/:subset/users/~/",
    "/:subset/users/~/:fields/",
    "/:subset/users/:offset~:limit/",
    "/:subset/users/:offset~:limit/:fields/",
    "/:subset/users/~:limit/",
    "/:subset/users/~:limit/:fields/",
  ],
  (req, res) => {
    console.log("GET", req.originalUrl)

    let {params, query} = req
    let db2 = db[dropLetter(params.subset)]

    let filterFn = makeFilterFn(R.firstOk([query.filters && JSON.parse(query.filters), {}]))
    let sortFn = makeSortFn(R.firstOk([query.sort, "+id"]))
    let offset = Number(R.firstOk([params.offset, query.offset, 0]))
    let limit = Math.min(Number(R.firstOk([params.limit, query.limit, 20])), 100)
    let fields = R.firstOk([params.fields, query.fields, null])

    let models = R.pipe(
      R.values,
      R.filter(filterFn),
      R.sort(sortFn),
    )(db2.users) // :: Array Model

    let paginatedModels = R.pipe(
      R.slice(offset, offset + limit),
      fields
        ? R.map(R.pick(fields))
        : R.id,
    )(models) // :: Array Model

    setTimeout(() => {
      res.json({
        models: paginatedModels, // :: Array Model
        total: models.length,    // Number
      })
    }, 1000)
  }
)

// Get user(s) by id(s) ============================================================================
router.get(
  [
    "/:subset/users/:ids/",
    "/:subset/users/:ids/:fields/",
  ],
  (req, res) => {
    console.log("GET", req.originalUrl)

    let {params, query} = req
    let db2 = db[dropLetter(params.subset)]

    let fields = R.firstOk([params.fields, query.fields, null])

    let models = R.pipe(
      R.pick(params.ids),
      fields
        ? R.map(R.pick(fields))
        : R.id,
    )(db2.users)

    setTimeout(() => {
      res.json({
        models // :: Object Model
      })
    }, 1000)
  }
)

let dropLetter = (s) => /[a-z]$/.test(s) ? R.dropLast(1, s) : s
