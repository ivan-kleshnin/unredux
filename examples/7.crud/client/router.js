import * as F from "framework"

// Apps
import home from "./home"
import postCreate from "./post-create"
import userIndex from "./user-index"
import userDetail from "./user-detail"

// Static pages
import About from "./root/About"
import Contacts from "./root/Contacts"
import NotFound from "./root/NotFound"

let routes = [
  // Apps
  ["/",             home],
  ["/posts/create", postCreate],
  ["/users",        userIndex],
  ["/users/:id",    userDetail],

  // Static pages
  ["/about",    F.lift(About)],
  ["/contacts", F.lift(Contacts)],
  ["/*path",    F.lift(NotFound)],
]

export default F.makeRouter(routes)
