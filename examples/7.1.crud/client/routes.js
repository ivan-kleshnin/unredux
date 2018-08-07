import K from "kefir"

// Apps
import home from "./home" // post-index
import postDetail from "./post-detail"
// import postCreate from "./post-create"
// import postEdit from "./post-edit"

// Static pages
import About from "./common/About"
import Contacts from "./common/Contacts"
import NotFound from "./common/NotFound"

export default [
  // Apps
  ["/",                () => Promise.resolve(home)],
  ["/posts/create/",   () => Promise.resolve(postCreate)],
  ["/posts/edit/:id/", () => Promise.resolve(postEdit)],
  ["/posts/:id/",      () => Promise.resolve(postDetail)],

  // Static pages
  ["/about/",    () => Promise.resolve(() => ({Component: About}))],
  ["/contacts/", () => Promise.resolve(() => ({Component: Contacts}))],

  // Not found
  ["/*path", () => Promise.resolve(() => ({Component: NotFound}))],
]
