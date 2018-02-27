import {lift, makeRouter} from "framework"

// Static pages
import Home from "./common/Home"
import NotFound from "./common/NotFound"

// Apps
import postIndexApp from "./post-index"
import postIndex7App from "./post-index7"
import postDetailApp from "./post-detail"

let routes = [
  // Details
  ["/:subset/posts/:id/", postDetailApp],

  // Indexes
  ["/7/posts/", postIndex7App],
  ["/:subset/posts/", postIndexApp],

  // Static pages
  ["/", lift(Home)],
  ["/*path", lift(NotFound)],
]

export default makeRouter(routes)
