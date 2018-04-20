import K from "kefir"

// Static pages
import Home from "./common/Home"
import NotFound from "./common/NotFound"

// Apps
import postIndexApp from "./post-index"
import postIndex7App from "./post-index7"
import postDetailApp from "./post-detail"

export default [
  // Details
  ["/:subset/posts/:id/", postDetailApp],

  // Indexes
  ["/7/posts/", postIndex7App],
  ["/:subset/posts/", postIndexApp],

  // Static pages
  ["/", R.always({Component: Home})],

  // Not found
  ["/*path", R.always({
    Component: NotFound,
    action$: K.constant(function notFound(state) {
      return R.set2(["document", "title"], "Not Found", state)
    })
  })],
]
