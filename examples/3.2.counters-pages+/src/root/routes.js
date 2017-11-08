import * as R from "ramda"
import Route from "route-parser"
import React from "react"
import Home from "./Home"
import page1App from "../page1/app"
import page2App from "../page2/app"
import page3App from "../page3/app"

let homeApp = () => ({
  Component: Home,
})

let notFoundApp = () => ({
  Component: (props) => <div>Not Found</div>,
})

let routes = [
  ["/",      homeApp],
  ["/page1", page1App],
  ["/page2", page2App],
  ["/page3", page3App],
  ["/*path", notFoundApp],
]

export default R.map(
  ([mask, payload]) => [new Route(mask), payload],
  routes
)
