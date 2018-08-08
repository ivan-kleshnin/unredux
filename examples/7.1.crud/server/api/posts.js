import {makeId} from "common/helpers"
import {makeFilterFn, makeSortFn} from "common/home"
import * as T from "common/types"
import {Router} from "../express"
import db from "../db.json"

let router = Router({
  caseSensitive: true,
  strict: true,
})

export default router

// Get posts by filters, sort and pagination =======================================================
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
    console.log("GET", req.originalUrl)

    let {params, query} = req

    let filterFn = makeFilterFn(R.firstOk([query.filters && JSON.parse(query.filters), {}]))
    let sortFn = makeSortFn(R.firstOk([query.sort, "+id"]))
    let offset = Number(R.firstOk([params.offset, query.offset, 0]))
    let limit = Math.min(Number(R.firstOk([params.limit, query.limit, 20])), 100)
    let fields = R.firstOk([params.fields, query.fields, null])

    let models = R.pipe(
      R.values,
      R.filter(filterFn),
      R.sort(sortFn),
    )(db.posts) // :: Array Model

    let paginatedModels = R.pipe(
      R.slice(offset, offset + limit),
      fields
        ? R.map(R.pick(fields))
        : R.id,
    )(models) // :: Array Model

    res.json({
      models: paginatedModels, // :: Array Model
      total: models.length,    // Number
    })
  }
)

// Get post(s) by id(s) ============================================================================
router.get(
  [
    "/:ids/",
    "/:ids/:fields/",
  ],
  (req, res) => {
    console.log("GET", req.originalUrl)

    let {params, query} = req
    let fields = R.firstOk([params.fields, query.fields, null])

    let models = R.pipe(
      R.pick(params.ids),
      fields
        ? R.map(R.pick(fields))
        : R.id,
    )(db.posts)

    res.json({models}) // :: Object Model
  }
)

// Create post =====================================================================================
router.post(
  "/",
  (req, res) => {
    let form = req.body
    let post
    try {
      // Realistic API will have a per-field validation here instead...
      // Form -> Model parsing
      post = T.Post({
        id: makeId(),
        title: form.title,
        text: form.text,
        tags: T.strToTags(form.tags),
        isPublished: form.isPublished,
        publishDate: new Date(form.publishDate),
      })
    } catch (err) {
      return res.status(400).json({message: err.message})
    }
    db.posts[post.id] = post // TODO persistence
    res.status(201).json({model: post})
  }
)

// Edit post =======================================================================================
router.put(
  "/:id/",
  (req, res) => {
    let form = req.body
    let post
    try {
      // Realistic API will have a per-field validation here instead...
      // Form -> Model parsing
      post = T.Post({
        id: req.params.id,
        title: form.title,
        text: form.text,
        tags: T.strToTags(form.tags),
        isPublished: form.isPublished,
        publishDate: form.publishDate,
      })
    } catch (err) {
      return res.status(400).json({message: err.message})
    }
    db.posts[post.id] = post // TODO persistence
    res.status(200).json({model: post})
  }
)
