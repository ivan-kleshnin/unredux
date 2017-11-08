import routes from "./routes"

// type Routes = Array (String, Payload)

// makeRouter :: Routes -> {doroute :: Function, unroute :: Function}
let makeRouter = (routes) => {
  // doroute :: String -> {mask :: String, params :: Object, payload :: any)
  let doroute = (url) => {
    for (let [route, payload] of routes) {
      let match = route.match(url)
      if (match) {
        return {mask: route.spec, params: match, payload}
      }
    }
    throw Error(`${inspect(url)} does not match any known route`)
  }

  // unroute :: (String, Params) -> String
  let unroute = (mask, params) => {
    for (let [route, payload] of routes) {
      if (route.spec == mask) {
        return route.reverse(params)
      }
    }
    throw Error(`${inspect(mask)} does not match any known route`)
  }

  return {doroute, unroute}
}

export default makeRouter(routes)
