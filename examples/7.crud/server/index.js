// import http from "http"
import * as R from "../../../vendors/ramda"
import Express from "express"
import BodyParser from "body-parser"
import cors from "cors"
// import morgan from 'morgan'
// import initializeDb from './db'
// import middleware from './middleware'
// import api from './api'
// import config from './config.json'

let app = Express()
// app.server = http.createServer(app);

// logger
// app.use(morgan('dev'));

// 3rd party middleware
app.use(cors())

app.use(BodyParser.json({
	limit: null, // config.bodyLimit
}))

// connect to db
// initializeDb(db => {
//
// 	// internal middleware
// 	app.use(middleware({ config, db }));
//
// 	// api router
// 	app.use('/api', api({ config, db }));
//
// 	app.server.listen(process.env.PORT || config.port, () => {
// 		console.log(`Started on port ${app.server.address().port}`);
// 	});
// });

let data = {
  users: {
    "1": {"id": "1", "fullname": "Jacinto", "email": "jac@gmail.com", "role": "admin"},
    "2": {"id": "2", "fullname": "Jabberworker", "email": "jab@gmail.com", "role": "admin"},
    "3": {"id": "3", "fullname": "Gizmo", "email": "giz@gmail.com", "role": "manager"},
    "4": {"id": "4", "fullname": "Jezhik", "email": "jez@gmail.com", "role": "pet"},
  },
  posts: {
    "1": {"id": "1", "title": "Foo"},
    "2": {"id": "2", "title": "Bar"},
  },
}

// getOne :: Path -> a
// function getOne(path, data) {
//   return R.view(path, data)
// }

// getMany :: Array Path -> Object a
// function getMany(pathSet, data) {
//   return R.reduce((z, path) => {
//     return R.set(path, R.view(path, data), z)
//   }, {}, pathSet)
// }

let notNil = R.complement(R.isNil)

let splitIds = R.pipe(R.split("/"), R.nth(-1), R.split(","))

// TODO split on routers ///////////////////////////////////////////////////////////////////////////

// GET users by filter, sort and pagination ========================================================
app.get(
  [
    "/users/",
    "/users/~/:field/",
    "/users/:offset~:limit/",
    "/users/:offset~:limit/:field/",
    "/users/~:limit/",
    "/users/~:limit/:field/",
  ],
  (req, res) => {
    let {params, query} = req

    // TODO filterFn, sortFn
    let filterFn = R.id
    let sortFn = R.ascend(R.prop("id"))
    let offset = R.find(notNil, [params.offset, query.offset, 0])
    let limit = R.find(notNil, [params.limit, query.limit, 20])
    let field = R.find(notNil, [params.field, query.field, null])

    let models = R.pipe(
      R.values,
      R.filter(filterFn),
      R.sort(sortFn),
      R.slice(offset, offset + limit),
      field
        ? R.map(R.prop(field))
        : R.id,
    )(data.users)

    res.json(models)
  }
)

// GET users by ids ================================================================================
app.get(/users\/\d+(,\d+)*/, (req, res) => {
  req.params.ids = splitIds(req.path)
  let {params, query} = req
  let field = R.find(notNil, [query.field, null])

  let models = R.pipe(
    R.props(params.ids),
    field
      ? R.prop(field)
      : R.id,
  )(data.users)

  res.json(models)
})

// GET user by id ==================================================================================
app.get("/users/:id", (req, res) => {
  let {params, query} = req
  let field = R.find(notNil, [query.field, null])

  let model = R.pipe(
    R.prop(params.id),
    field
      ? R.prop(field)
      : R.id,
  )(data.users)

  if (model)
    res.json(model)
  else
    res.status(404).end()
})

// GET posts by filter, sort and pagination ========================================================
app.get(
  [
    "/posts/",
    "/posts/~/:field/",
    "/posts/:offset~:limit/",
    "/posts/:offset~:limit/:field/",
    "/posts/~:limit/",
    "/posts/~:limit/:field/",
  ],
  (req, res) => {
    let {params, query} = req

    // TODO filterFn, sortFn
    let filterFn = R.id
    let sortFn = R.ascend(R.prop("id"))
    let offset = R.find(notNil, [params.offset, query.offset, 0])
    let limit = R.find(notNil, [params.limit, query.limit, 20])
    let field = R.find(notNil, [params.field, query.field, null])

    let models = R.pipe(
      R.values,
      R.filter(filterFn),
      R.sort(sortFn),
      R.slice(offset, offset + limit),
      field
        ? R.map(R.prop(field))
        : R.id,
    )(data.posts)

    res.json(models)
  }
)

// GET posts by ids ================================================================================
app.get(/posts\/\d+(,\d+)*/, (req, res) => {
  req.params.ids = splitIds(req.path)
  let {params, query} = req
  let field = R.find(notNil, [query.field, null])

  let models = R.pipe(
    R.props(params.ids),
    field
      ? R.prop(field)
      : R.id,
  )(data.posts)

  res.json(models)
})

// GET post by id ==================================================================================
app.get("/posts/:id", (req, res) => {
  let {params, query} = req
  let field = R.find(notNil, [query.field, null])

  let model = R.pipe(
    R.prop(params.id),
    field
      ? R.prop(field)
      : R.id,
  )(data.posts)

  if (model)
    res.json(model)
  else
    res.status(404).end()
})

////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(process.env.PORT || 3000, () => {
  console.log(`Started on port ${process.env.PORT || 3000}`)
})

// select * from users
// ["users"]

// select id from users
// ["users", "..", "id"]

// select * from users where id = 1
// ["users", {"$eq": {"id": "1"}}]

// select * from users where id in (1, 2, 3)
// ["users", {"$in": {"id": ["1", "2"]}}]

// select * from users offset = 0 AND limit = 10
// ["users"] {offset: 0, limit: 10}


// le
//
// "todos", "1", "name"
// "todos", "1", "done"

// "todos[0].done"
// "todos[1].name"
// "todos[1].done"











