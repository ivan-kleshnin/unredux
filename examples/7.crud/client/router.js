import * as F from "framework"

// Apps
import home from "./home" // post-index
import postDetail from "./post-detail"
import postCreate from "./post-create"
import postEdit from "./post-edit"

import userIndex from "./user-index"
import userDetail from "./user-detail"

// Static pages
import About from "./common/About"
import Contacts from "./common/Contacts"
import NotFound from "./common/NotFound"

let routes = [
  // Apps
  ["/",                home],
  ["/posts/create/",   postCreate],
  ["/posts/edit/:id/", postEdit],
  ["/posts/:id/",      postDetail],
  ["/users/",          userIndex],
  ["/users/:id/",      userDetail],

  // Static pages
  ["/about/",    F.lift(About)],
  ["/contacts/", F.lift(Contacts)],
  ["/*path",     F.lift(NotFound)],
]

export default F.makeRouter(routes)
