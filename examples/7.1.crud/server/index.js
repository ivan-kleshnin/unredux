import BodyParser from "body-parser"
import Cors from "cors"
import P from "pathz"
import "shims"
import {APP_KEY} from "client/meta"
import Express, {unless} from "./express"
import mocksRoutes from "./mocks"
import apiPostsRoutes from "./api/posts"
import apiUsersRoutes from "./api/users"
import {appLayout} from "./templates"

// GLOBALS
global.protocol = "http"
global.hostname = "localhost"
global.port = "8080"
global.host = `${global.hostname}:${global.port}`

// APP
let app = Express()
app.use(Cors())

// Permit the app to parse application/x-www-form-urlencoded
app.use(BodyParser.urlencoded({
  extended: false
}))

app.use(BodyParser.json({
  limit: null, // TODO
}))

// STATIC
let publicDir = P.resolve(__dirname, "../public")
let staticExts = ["html", "xml", "css", "js", "jpg", "jpeg", "png", "gif", "json", "pdf"]
let staticRe = new RegExp(`.(${staticExts.join("|")})$`)

app.use("/", Express.static(publicDir, {extensions: staticExts}))

// MOCKS
app.use("/mocks", mocksRoutes)

// API
app.use("/api/posts", apiPostsRoutes)
app.use("/api/users", apiUsersRoutes)

// CLIENT
app.get("/*", unless([staticRe], (req, res, next) => {
  res.send(appLayout({
    appKey: APP_KEY,
    appHTML: "",
  }))
}))

// ERROR HANDLERS
app.use((req, res, next) => {
  res.status(404)
  res.send("Not Found") // Serve "public/errors/404.html" here
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500)
  res.send("Server Error") // Serve "public/errors/500.html" here
})

let server = app.listen(global.port, () => {
  console.log(`Listening on port ${global.port}, pid ${process.pid}`)
})

export default server
