import A from "axios"
import BodyParser from "body-parser"
import Cors from "cors"
import P from "pathz"
import "vendors/shims"
import Express, {unless} from "./express"
import mocksRoutes from "./mocks"
import apiPostsRoutes from "./api/posts"
import apiUsersRoutes from "./api/users"
import ssrRoutes from "./ssr"

let app = Express()

app.set("port", process.env.PORT || 8080)

A.defaults.baseURL = "http://localhost:" + app.get("port")

app.use(Cors())

// Permit the app to parse application/x-www-form-urlencoded
app.use(BodyParser.urlencoded({
  extended: false
}))

app.use(BodyParser.json({
  limit: null, // TODO
}))

// STATIC
app.use("/public", Express.static(P.resolve(__dirname, "../public")))

// MOCKS
app.use("/mocks", mocksRoutes)

// API
app.use("/api", apiPostsRoutes)
app.use("/api", apiUsersRoutes)

// SSR
app.use(unless(["/public", "/favicon", "/api", "/mocks"], ssrRoutes))

// ERROR HANDLERS
app.use((req, res, next) => {
  res.status(404).send("Not Found") // Serve "public/errors/404.html" here
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send("Server Error") // Serve "public/errors/500.html" here
})

let server = app.listen(app.get("port"), () => {
  console.log(`Listening on port ${app.get("port")}, pid ${process.pid}`)
})
