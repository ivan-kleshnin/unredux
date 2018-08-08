import K from "kefir"

// Apps
import home from "./home" // post-index
import postDetail from "./post-detail"
// import postCreate from "./post-create"
// import postEdit from "./post-edit"

// Static pages
import About from "./common/About"
import NotFound from "./common/NotFound"

export default [
  // Load on-demand like this:
  // ["/", () => import(/* webpackChunkName: "home" */"./home").then(module => module.default)],
  // (needs an additional Webpack setup we omit here)

  // Apps
  ["/",                () => Promise.resolve(home)],
  ["/posts/create/",   () => Promise.resolve(postCreate)],
  ["/posts/edit/:id/", () => Promise.resolve(postEdit)],
  ["/posts/:id/",      () => Promise.resolve(postDetail)],

  // Static pages
  ["/about/",    () => Promise.resolve(() => ({Component: About}))],

  // Not found
  ["/*path", () => Promise.resolve(() => ({
    Component: NotFound,
  }))],
]
