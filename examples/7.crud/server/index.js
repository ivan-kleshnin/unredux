// import http from "http"
import * as R from "../../../vendors/ramda"
import Express from "express"
import BodyParser from "body-parser"
import cors from "cors"
// import morgan from 'morgan'
// import middleware from './middleware'
// import api from './api'
// import config from './config.json'
import postsAPI from "./api/posts"
import usersAPI from "./api/users"

let app = Express()
// app.server = http.createServer(app)

// logger
// app.use(morgan('dev'));

// 3rd party middleware
app.use(cors())

app.use(BodyParser.json({
	limit: null, // config.bodyLimit
}))

app.use("/api/posts", postsAPI)
app.use("/api/users", usersAPI)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Started on port ${process.env.PORT || 3000}`)
})
