import * as F from "framework"

// Apps
import userIndex from "./user-index/app"
import userDetail from "./user-detail/app" // TODO rename `app.js` to `index.js` for cleaner imports?

// Static pages
import Home from "./root/Home"
import About from "./root/About"
import Contacts from "./root/Contacts"
import NotFound from "./root/NotFound"

let routes = [
  // Apps
  ["/users", userIndex],
  ["/users/:id", userDetail],

  // Static pages
  ["/",         F.lift(Home)],
  ["/about",    F.lift(About)],
  ["/contacts", F.lift(Contacts)],
  ["/*path",    F.lift(NotFound)],
]

export default F.makeRouter(routes)
