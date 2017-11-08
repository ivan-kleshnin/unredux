import React from "react"
import {Observable as O, ReplaySubject} from "../rxjs"
import {combineLatestObj} from "rx-utils"
import * as R from "../ramda"
import uid from "uid-safe"

export let derive = (streamsToProps, mapFn) =>
  combineLatestObj(streamsToProps)
    .map(mapFn)
    .distinctUntilChanged(R.identical)
    .publishReplay(1)
    .refCount()

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
      listen: (eventName) => {
        return O.fromEvent(document.querySelector(appSelector), eventName)
          .throttleTime(10, undefined, {leading: true, trailing: true})
          .filter(event => {
            return event.target.matches(R.join(" ", selectors))
          })
          // .map(event => {
          //   if (event.target.dataset && event.target.dataset.val) {
          //     return event.target.dataset.val
          //   } else if (event.target.value) {
          //     return event.target.value
          //   } else {
          //     return event.target
          //   }
          // })
          .share()
      }
    }
  }
  return collectFn([appSelector])
}

export let connect = (streamsToProps, ComponentToWrap, hooks={}) => {
  class Container extends React.Component {
    constructor(props) {
      super(props)
      this.state = {} // will be replaced with seed on componentWillMount
    }

    componentWillMount(...args) {
      let props = combineLatestObj(streamsToProps)
        .throttleTime(10, undefined, {leading: true, trailing: true}) // RxJS throttle is half-broken (https://github.com/ReactiveX/rxjs/search?q=throttle&type=Issues)
      this.sb = props.subscribe((data) => {
        this.setState(data)
      })
      if (R.is(Function, hooks.componentWillMount)) {
        hooks.componentWillMount(...args)
      }
    }

    componentWillUnmount(...args) {
      this.sb.unsubscribe()
      if (R.is(Function, hooks.componentWillUnmount)) {
        hooks.componentWillUnmount(...args)
      }
    }

    render() {
      // TODO if this.state == {} return <div/> or Loading???
      return React.createElement(ComponentToWrap, R.merge(this.props, this.state), this.props.children)
    }
  }

  return Container
}

export let lastKey = R.pipe(R.split("."), R.nth(-1))

// export let defaultSources = () => {
//   let state$ = new ReplaySubject(1)
//   let props = {}
//   let DOM = {
//     fromKey: () => DOM,
//     from: () => DOM,
//     listen: () => O.of(),
//   }
//   return {state$, props, DOM}
// }

export let isolateSources = {
  state$: (source, key) => source
    .pluck(lastKey(key))
    .distinctUntilChanged(R.identical),
    // .publishReplay(1)
    // .refCount(),

  props: R.always,

  DOM: (source, key) => source.fromKey(lastKey(key))
}

// export let defaultSinks = () => {
//   let action$ = O.of()
//   let state$ = O.of()
//   let DOM = (props) => null
//   return {action$, state$, DOM}
// }

export let isolateSinks = {
  action$: (sink, key) => {
    return sink.map(command => {
      return {fn: R.over, args: [lastKey(key), command]}
    })
  },

  state$: (sink, key) => {
    return sink // has to be isolated on consumer part
  },

  Component: (sink, key) => {
    return (props) => <div data-key={lastKey(key)}>
      {React.createElement(sink, props)}
    </div>
  },
}

export let isolate = (app, appKey=null) => {
  appKey = appKey || uid.sync(4)
  return function App(sources) {
    // Prepare sources
    let isolatedSources = R.mapObjIndexed(
      (source, sourceKey) => isolateSources[sourceKey](source, appKey),
      sources
    )
    let properSources = R.merge({} /*defaultSources()*/, isolatedSources)

    // Run app (unredux component)
    let sinks = app(properSources, appKey)

    // Prepare sinks
    let isolatedSinks = R.mapObjIndexed(
      (sink, sinkKey) => isolateSinks[sinkKey](sink, appKey),
      sinks
    )
    let properSinks = R.merge({} /*defaultSinks()*/, isolatedSinks)

    return properSinks
  }
}

// function isolateSingle(busKey, app, appKey=null) {
//   appKey = appKey || uid.sync(4)
//   return function App(sources) {
//     // Prepare sources
//     let isolatedSources = R.mapObjIndexed(
//       (source, sourceKey) => {
//         return sourceKey == busKey
//           ? templates[busKey].isolateSource(source, appKey)
//           : source
//       },
//       sources
//     )
//     let properSources = R.merge(defaultSources(), isolatedSources)
//
//     // Run app (unredux component)
//     let sinks = app(properSources, appKey)
//
//     // Prepare sinks
//     let isolatedSinks = R.mapObjIndexed(
//       (sink, sinkKey) => {
//         return sinkKey == busKey
//           ? templates[sinkKey].isolateSink(sink, appKey)
//           : sink
//       },
//       sinks
//     )
//     let properSinks = R.merge(defaultSinks(), isolatedSinks)
//
//     return properSinks
//   }
// }

export let liftSinks = (sinks) => {
  return R.merge(defaultSinks(), sinks)
}
