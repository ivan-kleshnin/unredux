import * as F from "framework"

// Static pages
import Home from "./common/Home"
import NotFound from "./common/NotFound"

// Apps
import postLazyLoadApp from "./post-lazyload"
import postDetailApp from "./post-detail"

let routes = [
  // Indexes
  ["/posts/lazyload/", postLazyLoadApp],
  ["/posts/:id/", postDetailApp],

  // Static pages
  ["/", F.lift(Home)],
  ["/*path", F.lift(NotFound)],
]

export default F.makeRouter(routes)
