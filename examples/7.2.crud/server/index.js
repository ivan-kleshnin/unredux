import A from "axios"
import BodyParser from "body-parser"
import Cors from "cors"
import Path from "path"
import Express, {unless} from "./express"
import mocksRoutes from "./mocks"
import mocksFoosRoutes from "./mocks/foos"
import apiPostsRoutes from "./api/posts"
import apiUsersRoutes from "./api/users"
import ssrRoutes from "./ssr"
import {layout404, layout500} from "./ssr/layout"

let app = Express()

app.set("port", process.env.PORT || 8080)

A.defaults.baseURL = "http://localhost:" + app.get("port")

app.enable("strict routing") // does not work, broken in Express :(
app.enable("case sensitive routing")

app.use(Cors())

// Permit the app to parse application/x-www-form-urlencoded
app.use(BodyParser.urlencoded({
  extended: false
}))

app.use(BodyParser.json({
	limit: null, // TODO
}))

// STATIC
app.use("/public", Express.static(Path.resolve(__dirname, "../public")))

// MOCKS
app.use("/mocks", mocksRoutes)
app.use("/mocks", mocksFoosRoutes)

// API
app.use("/api/posts", apiPostsRoutes)
app.use("/api/users", apiUsersRoutes)

// SSR
app.use(unless(["/public", "/mocks", "/favicon"], ssrRoutes))

// ERROR HANDLERS
app.use((req, res, next) => {
  res.status(404).send(layout404())
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send(layout500())
})

let server = app.listen(app.get("port"), () => {
  console.log(`Listening on port ${app.get("port")}`)
})
