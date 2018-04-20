// Apps
import page1 from "./page1"
import page2 from "./page2"
import page3 from "./page3"

// Static pages
import Home from "./root/Home"
import NotFound from "./root/NotFound"

export default [
  // Apps
  ["/page1", page1],
  ["/page2", page2],
  ["/page3", page3],

  // Static pages
  ["/", R.always({Component: Home})],

  // Not found
  ["/*path", R.always({Component: NotFound})], // for SSR: {action$: K.constant(/* set state.document.notFound = true or whatever */)}
]
