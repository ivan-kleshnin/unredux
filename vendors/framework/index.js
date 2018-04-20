import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import Route from "route-parser"
import U from "urlz"
import nanoid from "nanoid"

// HELPERS =========================================================================================
let handleError = e => console.warn(e)

let lastKey = R.pipe(R.split("."), R.nth(-1), String)

// ASYNC & REACTIVE ================================================================================
// Number -> Promise ()
export let delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

// Array a -> $ a
export let spread = (xs) => K.sequentially(0, xs)

export let derive = D.derive
export let deriveObj = D.deriveObj
export let deriveArr = D.deriveArr

export let deriveModelsObj = (table$, ids$, validateFn) => {
  return D.deriveArr(
    [table$, ids$],
    (table, ids) => {
      return R.reduce((z, id) => {
        let model = table[id]
        if (validateFn(model)) {
          z[id] = model
        }
        return z
      }, {}, ids)
    }
  )
}

export let deriveModelsArr = (table$, ids$, validateFn) => {
  return D.deriveArr(
    [table$, ids$],
    (table, ids) => {
      return R.reduce((z, id) => {
        let model = table[id]
        if (validateFn(model)) {
          z.push(model)
        }
        return z
      }, [], ids)
    }
  )
}

export let deriveModel = (table$, id$, validateFn) => {
  return D.deriveArr(
    [table$, id$],
    (table, id) => {
      let model = table[id]
      return validateFn(model) ? model : null
    }
  )
}

export let poolProp = () => {
  let pool = K.pool()
  let prop = pool.toProperty()
  prop.plug = (x) => {
    if (x instanceof K.Property) {
      pool.plug(x)
    }
    else if (x instanceof K.Stream || x instanceof K.Observable) {
      throw Error("can't handle stateless stream, use property instead")
    }
    else {
      pool.plug(K.constant(x))
    }
  }
  return prop
}

// DOM =============================================================================================
export let fromDOMEvent = (appSelector) => {
  let collectFn = (selectors) => {
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

      listen: (eventName, options = {}) => {
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

export let connect = (streamsToProps, ComponentToWrap) => {
  class Container extends React.Component {
    constructor(props) {
      super(props)

      this.state = {}

      Container.constructor$.plug(K.constant(props))
    }

    componentWillMount(...args) {
      let props$ = K.combine(streamsToProps)
        .throttle(20, {leading: false})

      if (!D.isBrowser) {
        /**
         * `componentWillMount` should be triggered after the state is formed so `props$ = props$.take(1)`
         * does NOT limit client app on server to a single 1 state update!
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

// APPS ============================================================================================
export let isolateSources = {
  state$: (source, key) => source
    .map(x => x[lastKey(key)])
    .skipDuplicates(R.identical),

  DOM: (source, key) => source.fromKey(lastKey(key)),
}

export let isolateSinks = {
  action$: (sink$, key) => {
    let k = lastKey(key)
    return sink$.map(action => {
      return R.withName(`over("${k}", ${action.name || "anonymous"})`, R.over2(k, action))
    })
  },

  Component: (sink, key) => {
    return (props) => <div data-key={lastKey(key)}>
      {React.createElement(sink, props)}
    </div>
  },
}

export let defaultSources = {} // TODO

export let defaultSinks = {
  action$: K.never(),

  load$: K.never(),

  Component: () => null,
}

export let isolate = (app, appKey = null, types = null) => {
  appKey = appKey || nanoid()
  return (sources, props) => {
    // Prepare sources
    let isolatedSources = R.mapObjIndexed(
      (source, type) => (!types || R.contains(type, types)) && isolateSources[type]
        ? isolateSources[type](source, appKey)
        : source,
      R.merge(defaultSources, sources)
    )

    // Run app
    let sinks = app(isolatedSources, {...props, key: appKey})

    // Prepare sinks
    let isolatedSinks = R.mapObjIndexed(
      (sink, type) => (!types || R.contains(type, types)) && isolateSinks[type]
        ? isolateSinks[type](sink, appKey)
        : sink,
      R.merge(defaultSinks, sinks)
    )

    return isolatedSinks
  }
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

// ROUTING =========================================================================================

// type Routes = Array (String, Payload)

// makeRouter :: Routes -> {doroute :: Function, unroute :: Function}
export let makeRouter = (routes) => {
  routes = R.map(
    ([mask, payload]) => [new Route(mask), payload],
    routes
  )

  // doroute :: String -> {mask :: String, params :: Object, payload :: any)
  let doroute = (url) => {
    url = U.pathname(String(url))
    for (let [route, payload] of routes) {
      let match = route.match(url)
      if (match) {
        return {mask: route.spec, params: match, payload}
      }
    }
    throw Error(`'${url}' does not match any known route`)
  }

  // unroute :: (String, Params) -> String
  let unroute = (mask, params) => {
    mask = String(mask)
    for (let [route, payload] of routes) {
      if (route.spec == mask) {
        return route.reverse(params)
      }
    }
    throw Error(`'${mask}' does not match any known route`)
  }

  return {doroute, unroute}
}

export let withRoute = R.curry((options, app) => {
  options = R.merge(withRoute.options, options)

  let router = makeRouter(options.routes)

  return (sources, props) => {
    let navigateTo$ = sources.DOM.from("a").listen("click")
      .filter(ee => !ee.element.dataset.ui) // skip <a data-ui .../> links
      .flatMapConcat(ee => {
        let urlObj = U.parse(ee.element.href)
        if (urlObj.protocol && urlObj.host != document.location.host) {
          // External link
          return K.never()
        }
        else if (ee.event.shiftKey || navigator.platform.match("Mac") ? ee.event.metaKey : ee.event.ctrlKey) {
          // Holding Shift or Ctrl/Cmd
          return K.never()
        }
        else {
          // Internal link
          ee.event.preventDefault() // take control of browser
          window.history.pushState({}, "", urlObj.relHref)
          if (urlObj.hash) {
            let elem = document.getElementById(urlObj.hash.slice(1))
            if (elem) {
              elem.scrollIntoView()
            }
          }
          else {
            window.scrollTo(0, 0)
          }
          return K.constant(urlObj.relHref)
        }
      })

    let navigateHistory$ = D.isBrowser
      ? K.fromEvents(window, "popstate")
          .map(data => {
            let urlObj = U.parse(document.location.href)
            if (urlObj.hash) {
              document.getElementById(urlObj.hash).scrollIntoView()
            }
            else {
              window.scrollTo(0, 0)
            }
            return urlObj.relHref
          })
      : K.never()

    let route$ = K
      .merge([
        K.constant(props.url),
        navigateTo$,
        navigateHistory$,
      ])
      .diff(null, null)
      .filter(([prevUrl, nextUrl]) => {
        // TODO account QS
        return !prevUrl || U.pathname(prevUrl) != U.pathname(nextUrl)
      })
      .map(R.nth(1))
      .map(url => {
        let {mask, params, payload: app} = router.doroute(url)
        return {url, mask, params, app}
      })
      .toProperty()

    let page$ = route$.map(({mask, params, app}) => {
      let app2 = isolate(app, props.key + mask, ["DOM", "Component"])

      return app2({
        ...sources,
      }, {
        ...props,
        mask,
        params,
        router
      })
    }).toProperty()

    return app({...sources, route$, page$}, {...props, router})
  }
})

withRoute.options = {
  routes: [],
}
