import * as R from "@paqmind/ramda"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import Route from "route-parser"
import U from "urlz"
import nanoid from "nanoid"

export let fromDOMEvent = (appSelector) => {
  function collectFn(selectors) {
    return {
      __selectors: selectors,
      from: (selector) => {
        return collectFn([...selectors, selector])
      },
      fromKey: (key) => {
        return collectFn([...selectors, `[data-key="${key}"]`])
      },
      fromName: (name) => {
        if (R.startsWith("^", name)) {
          return collectFn([...selectors, `[name^="${R.drop(1, name)}"]`])
        } else if (R.endsWith("$", name)) {
          return collectFn([...selectors, `[name$="${R.dropLast(1, name)}"]`])
        } else {
          return collectFn([...selectors, `[name="${name}"]`])
        }
      },
      listen: (eventName, options={}) => {
        if (D.isBrowser) {
          return K.fromEvents(document.querySelector(appSelector), eventName) // , options TODO
          .throttle(10)
          .flatten(event => {
            let element = event.target
            let selector = R.join(" ", selectors)
            while (element && element.matches) {
              if (element.matches(selector)) {
                return [{event, element}]
              }
              element = element.parentNode
            }
            return []
          })
        } else {
          return K.never()
        }
      }
    }
  }
  return collectFn([appSelector])
}

let handleError = e => console.warn(e)

export let connect = (streamsToProps, ComponentToWrap) => {
  class Container extends React.Component {
    constructor(props) {
      super(props)

      this.state = {}

      Container.constructor$.plug(K.constant(props))
    }

    componentWillMount(...args) {
      let props$ = K.combine(streamsToProps)
        .throttle(10, {leading: false, trailing: true})

      if (D.isServer) {
        /**
         * componentWillMount should be triggered after the state is formed so `props$ = props$.take(1)`
         * doesn't limit client to have only 1 state update. Example SSR usage:
         *
         * sinks.state$
         *   .throttle(10)
         *   .skipDuplicates(R.equals)
         *   .skipWhile(s => R.any(Boolean, R.values(s._loading))) // !!! consumes N events
         *   .merge(timeoutError(500))
         *   .take(1)       // !!! !consume a single event
         *   .takeErrors(1) // ^^^
         *   .observe(state => {
         *    let appHTML = ReactDOMServer.renderToString(<sinks.Component/>) // !!! initiates componentWillMount
         *     res.send(layout200({appKey, appHTML, state, project}))
         *   })
         */
        props$ = props$.take(1)
      }

      this.sb = props$.observe(data => {
        this.setState(data)
      }, handleError)

      Container.willMount$.plug(K.constant(args))
    }

    componentWillUnmount(...args) {
      this.sb.unsubscribe()

      Container.willUnmount$.plug(K.constant(args))
    }

    render() {
      return React.createElement(ComponentToWrap, R.merge(this.props, this.state), this.props.children)
    }
  }

  Container.constructor$ = K.pool()
  Container.willMount$ = K.pool()
  Container.willUnmount$ = K.pool()

  return Container
}

export let lastKey = R.pipe(R.split("."), R.nth(-1))

export let isolateSources = {
  state$: (source, key) => source
    .map(x => x[lastKey(key)])
    .skipDuplicates(R.identical),

  props: R.always,

  DOM: (source, key) => source // source.fromKey(lastKey(key))
}

export let isolateSinks = {
  action$: (sink, key) => {
    return sink.map(command => {
      return {fn: R.over, args: [lastKey(key), command]}
    })
  },

  state$: R.id, // has to be isolated manually

  intents: R.id, // has to be isolated manually

  Component: (sink, key) => {
    return (props) => <div data-key={lastKey(key)}>
      {React.createElement(sink, props)}
    </div>
  },
}

export let isolate = (app, appKey=null, types=null) => {
  appKey = appKey || nanoid()
  return function App(sources) {
    // Prepare sources
    let isolatedSources = R.mapObjIndexed(
      (source, type) => !types || R.contains(type, types)
        ? isolateSources[type](source, appKey)
        : source,
      sources
    )
    let properSources = R.merge({}, isolatedSources)

    // Run app (unredux component)
    let sinks = app(properSources, appKey)

    // Prepare sinks
    let isolatedSinks = R.mapObjIndexed(
      (sink, type) => !types || R.contains(type, types)
        ? isolateSinks[type](sink, appKey)
        : sink,
      sinks
    )
    let properSinks = R.merge({}, isolatedSinks)

    return properSinks
  }
}

export let lift = (Component) => {
  return (sources) => ({
    Component: Component,
  })
}

export let withLifecycle = (fn) => {
  return R.withName(fn.name, (sources, key) => {
    sources = R.merge(sources, {
      Component: {
        willMount$: K.pool(),
        willUnmount$: K.pool(),
      }
    })
    let sinks = fn(sources, key)
    if (sinks.Component) {
      if (sinks.Component.willMount$) {
        sinks.Component.willMount$.take(1).observe(x => {
          sources.Component.willMount$.plug(K.constant(x))
        }, handleError)
      }
      if (sinks.Component.willUnmount$) {
        sinks.Component.willUnmount$.take(1).observe(x => {
          sources.Component.willUnmount$.plug(K.constant(x))
        }, handleError)
      }
    }
    return sinks
  })
}

let inspect = (d) => R.is(String, d) ? `'${d}'` : d

// type Routes = Array (String, Payload)

// makeRouter :: Routes -> {doroute :: Function, unroute :: Function}
export let makeRouter = (routes) => {
  routes = R.map(
    ([mask, payload]) => [new Route(mask), payload],
    routes
  )

  // doroute :: String -> {mask :: String, params :: Object, payload :: any)
  let doroute = (url) => {
    url = U.pathname(url)
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
