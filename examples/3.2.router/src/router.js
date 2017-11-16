import * as F from "framework"

// Apps
import page1App from "./page1/app"
import page2App from "./page2/app"
import page3App from "./page3/app" // TODO rename `app.js` to `index.js` for cleaner imports?

// Static pages
import Home from "./root/Home"
import NotFound from "./root/NotFound"

let routes = [
  // Apps
  ["/page1", page1App],
  ["/page2", page2App],
  ["/page3", page3App],

  // Static pages
  ["/",      F.lift(Home)],
  ["/*path", F.lift(NotFound)],
]

export default F.makeRouter(routes)
