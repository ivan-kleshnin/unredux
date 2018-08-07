import K from "kefir"

// Apps
import page1 from "./page1"
import page2 from "./page2"
import page3 from "./page3"

// Static pages
import Home from "./root/Home"
import NotFound from "./root/NotFound"

export default [
  // Load on-demand like this:
  // ["/", () => import(/* webpackChunkName: "home" */"./home").then(module => module.default)],
  // (needs an additional Webpack setup we omit here)

  // Apps
  ["/page1", () => Promise.resolve(page1)],
  ["/page2", () => Promise.resolve(page2)],
  ["/page3", () => Promise.resolve(page3)],

  // Static pages
  ["/", () => Promise.resolve(() => ({Component: Home, action$: K.never()}))],

  // Not found
  ["/*path", () => Promise.resolve(() => ({Component: NotFound, action$: K.never()}))],
  // for SSR: {action$: K.constant(/* set state.document.notFound = true or whatever */)}
]
