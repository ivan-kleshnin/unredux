import K from "kefir"

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

export default [
  // Apps
  ["/",                home],
  ["/posts/create/",   postCreate],
  ["/posts/edit/:id/", postEdit],
  ["/posts/:id/",      postDetail],
  ["/users/",          userIndex],
  ["/users/:id/",      userDetail],

  // Static pages
  ["/about/",    R.always({Component: About})],
  ["/contacts/", R.always({Component: Contacts})],

  // Not found
  ["/*path", R.always({
    Component: NotFound,
    action$: K.constant(function notFound(state) {
      return R.set2(["document", "title"], "Not Found", state)
    })
  })],
]
