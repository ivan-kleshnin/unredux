import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import Route from "route-parser"
import U from "urlz"
import QS from "querystring"
import nanoid from "nanoid"

// HELPERS =========================================================================================
let handleError = e => console.warn(e)

let lastKey = R.pipe(R.split("."), R.nth(-1), String)

// TODO move to URLz library
U.equals = (url1, url2) => {
  let u1 = U.parse(url1)
  let u2 = U.parse(url2)
  let q1 = QS.parse(u1.query)
  let q2 = QS.parse(u2.query)
  return u1.hostname == u2.hostname
    && (u1.port || 80) == (u2.port || 80)
    && u1.pathname == u2.pathname
    && R.equals(q1, q2)
}

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

// TODO move to Kefir.DB ///////////////////////////////////////////////////////////////////////////
export let pool = () => {
  let pool = K.pool()
  let stream = pool.filter(R.notNil)
  stream.plug = (x) => {
    if (x instanceof K.Property || x instanceof K.Stream || x instanceof K.Observable) {
      pool.plug(x)
    } else {
      pool.plug(K.constant(x))
    }
  }
  return stream
}

export let poolProp = (seed) => {
  let pool = K.pool()
  let prop = pool.filter(R.notNil).toProperty()
  prop.plug = (x) => {
    if (x instanceof K.Property) {
      pool.plug(x)
    } else if (x instanceof K.Stream || x instanceof K.Observable) {
      throw Error("can't handle stateless stream, use property instead")
    } else {
      pool.plug(K.constant(x))
    }
  }
  pool.plug(K.constant(R.clone(seed)))
  return prop
}
////////////////////////////////////////////////////////////////////////////////////////////////////

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

      Container.constructor$.plug(props)
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

      Container.willMount$.plug(args)
    }

    componentWillUnmount(...args) {
      this.sb.unsubscribe()

      Container.willUnmount$.plug(args)
    }

    render() {
      return React.createElement(ComponentToWrap, R.merge(this.props, this.state), this.props.children)
    }
  }

  Container.constructor$ = pool()
  Container.willMount$ = pool()
  Container.willUnmount$ = pool()

  return Container
}

// APPS ============================================================================================
export let isolateDOM = R.curry((app, key) => {
  return function (sources, props) {
    let sinks = app({
      ...sources,
      DOM: sources.DOM.fromKey(key),
    }, {...props, key})
    return {
      ...sinks,
      Component: function (componentProps) {
        return <div data-key={key}>
          {React.createElement(sinks.Component, componentProps)}
        </div>
      }
    }
  }
})

export let isolateState = R.curry((app, key) => {
  return function (sources, props) {
    let sinks = app({
      ...sources,
      state$: sources.state$.map(R.prop(key))
                            .skipDuplicates(R.identical),
    }, {...props, key})
    return {
      ...sinks,
      action$: sinks.action$.map(action => {
        return R.withName(`over("${key}", ${action.name || "anonymous"})`, R.over2(key, action))
      })
    }
  }
})

export let withLifecycle = (fn) => {
  return R.withName(fn.name, (sources, key) => {
    sources = R.merge(sources, {
      Component: {
        willMount$: pool(),
        willUnmount$: pool(),
      }
    })
    let sinks = fn(sources, key)
    if (sinks.Component) {
      if (sinks.Component.willMount$) {
        sinks.Component.willMount$.take(1).observe(
          sources.Component.willMount$.plug,
          handleError,
        )
      }
      if (sinks.Component.willUnmount$) {
        sinks.Component.willUnmount$.take(1).observe(
          sources.Component.willUnmount$.plug,
          handleError,
        )
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
    for (let [route, _] of routes) {
      if (route.spec == mask) {
        return route.reverse(params)
      }
    }
    throw Error(`'${mask}' does not match any known route`)
  }

  return {doroute, unroute}
}

export let withRouting = R.curry((options, app) => {
  options = R.merge(withRouting.options, options)

  let router = makeRouter(options.routes)

  return (sources, props) => {
    let intents = {
      navigateTo$: sources.DOM.from("a").listen("click")
        .filter(ee => {
          // skip `a[data-ui]`, `div[data-ui] a`, ... links
          let element = ee.element
          while (element && element.dataset) {
            if (element.dataset.ui) {
              return false
            }
            element = element.parentNode
          }
          return true
        })
        .flatMapConcat(ee => {
          // TODO merge the prev `filter` down here OR move filtering stuff up there
          if (!ee.element.href) {
            // Link without href
            return K.never()
          }
          let urlObj = U.parse(ee.element.href)
          if (urlObj.protocol && urlObj.host != document.location.host) {
            // External link
            return K.never()
          } else if (ee.event.shiftKey || navigator.platform.match("Mac") ? ee.event.metaKey : ee.event.ctrlKey) {
            // Holding Shift or Ctrl/Cmd
            return K.never()
          } else {
            // Internal link
            ee.event.preventDefault() // take control of browser
            if (urlObj.hash) {
              let elem = document.querySelector(urlObj.hash)
              if (elem) {
                elem.scrollIntoView()
              }
            } else {
              window.scrollTo(0, 0)
            }
            return K.constant(urlObj.relHref)
          }
        }),

      navigateHistory$: D.isBrowser
        ? K.fromEvents(window, "popstate")
            .map(data => {
              let urlObj = U.parse(document.location.href)
              // Browser recovers scroll position at popstate
              return urlObj.relHref
            })
        : K.never()
    }

    let urlPool$ = poolProp(props.url)

    let route$ = K
      .merge([
        urlPool$,
        intents.navigateTo$,
        intents.navigateHistory$,
      ])
      .skipDuplicates(U.equals)
      .flatMapLatest(url => {
        if (D.isBrowser) {
          window.history.pushState({}, "", url)
        }
        let routeResult = router.doroute(url)
        return K.fromPromise(routeResult.payload().then(app => {
          return {...routeResult, app, url}
        }))
      })
      .map(({mask, params, app, url}) => {
        let parsedUrl = U.parse(url)
        let query = QS.parse(parsedUrl.query)
        let hash = parsedUrl.hash // TODO why `withHash` uses non-hashmarked string while `parse` returns hashmarked string?!
        return {url, mask, params, query, hash, app}
      })
      .toProperty()

    let page$ = route$.map(({url, mask, params, query, hash, app}) => {
      let app2 = isolateDOM(app, props.key + mask)
      return app2(sources, {
        ...props,
        url,
        mask,
        params,
        query,
        hash,
        router,
      })
    })

    let page = {
      action$: page$.flatMapLatest(p => p.action$ || K.never()),

      load$: page$.flatMapLatest(p => p.load$ || K.never()),

      Component$: page$.map(p => p.Component),
    }

    let sinks = app({...sources, route$, page}, {...props, router})

    return {
      ...sinks,

      effect$: K.merge([
        // app effects
        sinks.effect$ || K.never(),

        // app2 effects
        page$.flatMapLatest(p => p.effect$ || K.never()),

        // app2 url -> effects
        page$.flatMapLatest(p => p.url$).delay(1).map(url => function plugUrl() {
          urlPool$.plug(url)
        }),
      ]),
    }
  }
})

withRouting.options = {
  routes: [],
}
