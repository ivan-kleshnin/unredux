import React from "react"
import Route from "route-parser"
import Url from "url"
import {Observable as O, Subject} from "../rxjs"
import {combineLatestObj} from "rx-utils"
import * as R from "../ramda"
import {isBrowser, isServer} from "../selfdb"
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
        if (isBrowser) {
          return O.fromEvent(document.querySelector(appSelector), eventName, options)
          .throttleTime(10, undefined, {leading: true, trailing: true})
          .concatMap(event => {
            let element = event.target
            let selector = R.join(" ", selectors)
            while (element && element.matches) {
              if (element.matches(selector)) {
                return O.of({event, element})
              }
              element = element.parentNode
            }
            return O.of()
          })
          .share()
        } else {
          return O.of()
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
      Container.constructor$.next()
      Container.constructor$.complete()
    }

    componentWillMount(...args) {
      let props$ = combineLatestObj(streamsToProps)
        .throttleTime(10, undefined, {leading: true, trailing: true})

      if (isServer)
        props$ = props$.take(1)

      this.sb = props$.subscribe((data) => {
        this.setState(data)
      })
      Container.willMount$.next(args)
      Container.willMount$.complete()
    }

    componentWillUnmount(...args) {
      this.sb.unsubscribe()
      Container.willUnmount$.next(args)
      Container.willUnmount$.complete()
    }

    render() {
      if (R.isEmpty(this.state)) {
        return <div>Loading...</div>
      } else {
        return React.createElement(ComponentToWrap, R.merge(this.props, this.state), this.props.children)
      }
    }
  }

  Container.constructor$ = new Subject()
  Container.willMount$ = new Subject()
  Container.willUnmount$ = new Subject()

  return Container
}

export let lastKey = R.pipe(R.split("."), R.nth(-1))

export let isolateSources = {
  state$: (source, key) => source
    .pluck(lastKey(key))
    .distinctUntilChanged(R.identical),
    // .publishReplay(1)
    // .refCount(),

  props: R.always,

  DOM: (source, key) => source.fromKey(lastKey(key))
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
  appKey = appKey || uid.sync(4)
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
        willMount$: new Subject(),
        willUnmount$: new Subject(),
      }
    })
    let sinks = fn(sources, key)
    if (sinks.Component) {
      if (sinks.Component.willMount$) {
        // Should unsubscribe automatically, reinforce with take(1)
        sinks.Component.willMount$.take(1).subscribe(sources.Component.willMount$)
      }
      if (sinks.Component.willUnmount$) {
        // Should unsubscribe automatically, reinforce with take(1)
        sinks.Component.willUnmount$.take(1).subscribe(sources.Component.willUnmount$)
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
    url = Url.parse(url).pathname
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
