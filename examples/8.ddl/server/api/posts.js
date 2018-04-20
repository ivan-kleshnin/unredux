import {makeFilterFn, makeSortFn} from "common/post-index"
import {Router} from "../express"
import _db0 from "../db0.json"
import _db1 from "../db1.json"
import _db2 from "../db2.json"
import _db3 from "../db3.json"
import _db4 from "../db4.json"
import _db5 from "../db5.json"
import _db6 from "../db6.json"
import _db7 from "../db7.json"

let _db = {0: _db0, 1: _db1, 2: _db2, 3: _db3, 4: _db4, 5: _db5, 6: _db6, 7: _db7}

let router = Router({
  caseSensitive: true,
  strict: true,
})

export default router

let dropLetter = (s) => /[a-z]$/.test(s) ? R.dropLast(1, s) : s

// Get posts by filters, sort and pagination =======================================================
router.get(
  [
    "/:subset/posts/",
    "/:subset/posts/~/",
    "/:subset/posts/~/:fields/",
    "/:subset/posts/:offset~:limit/",
    "/:subset/posts/:offset~:limit/:fields/",
    "/:subset/posts/~:limit/",
    "/:subset/posts/~:limit/:fields/",
  ],
  (req, res) => {
    console.log("GET", req.originalUrl)

    let {params, query} = req
    let db = _db[dropLetter(params.subset)]

    let filterFn = makeFilterFn(R.firstOk([query.filters && JSON.parse(query.filters), {}]))
    let sortFn = makeSortFn(R.firstOk([query.sort, "+id"]))
    let offset = Number(R.firstOk([params.offset, query.offset, 0]))
    let limit = Math.min(Number(R.firstOk([params.limit, query.limit, 20])), 100)
    let fields = R.firstOk([params.fields, query.fields, null])

    let models = R.pipe(
      R.values,
      R.filter(post => filterFn(post, db.users[post.userId])),
      R.sort(sortFn),
    )(db.posts) // :: Array Model

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

// Get post(s) by id(s) ============================================================================
router.get(
  [
    "/:subset/posts/:ids/",
    "/:subset/posts/:ids/:fields/",
  ],
  (req, res) => {
    console.log("GET", req.originalUrl)

    let {params, query} = req
    let db = _db[dropLetter(params.subset)]

    let fields = R.firstOk([params.fields, query.fields, null])

    let models = R.pipe(
      R.pick(params.ids),
      fields
        ? R.map(R.pick(fields))
        : R.id,
    )(db.posts)

    setTimeout(() => {
      res.json({
        models // :: Object Model
      })
    }, 1000)
  }
)


