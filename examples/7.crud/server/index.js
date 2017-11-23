import A from "axios"
import BodyParser from "body-parser"
import Cors from "cors"
import Path from "path"
import * as R from "ramda"
import Express, {unless} from "./express"
import apiPostsRoutes from "./api/posts"
import apiUsersRoutes from "./api/users"
import ssrRoutes from "./ssr"

let app = Express()

app.set("port", process.env.PORT || 8080)

A.defaults.baseURL = "http://localhost:" + app.get("port")

app.use(Cors())

app.use(BodyParser.json({
	limit: null, // TODO
}))

// STATIC
app.use("/public", Express.static(Path.resolve(__dirname, "../public")))

// API
app.use("/api/posts", apiPostsRoutes)
app.use("/api/users", apiUsersRoutes)

// SSR
app.use(unless("/public", ssrRoutes))

// ERROR HANDLERS
app.use((req, res, next) => {
  res.status(404).send("404")
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("500")
})

let server = app.listen(app.get("port"), () => {
  console.log(`Listening on port ${app.get("port")}`)
})
