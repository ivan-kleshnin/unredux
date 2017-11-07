import React from "react"
import {Observable as O, ReplaySubject} from "../rxjs"
import {combineLatestObj} from "rx-utils"
import * as R from "../ramda"
import uid from "uid-safe"

// TODO rx-utils candidate
export let init = (seed) =>
  O.of(R.fn("init", () => seed))

// TODO rx-utils candidate
export let derive = (lens, state$, mapFn) =>
  state$.map(lens ? R.view(lens) : R.id)
    .distinctUntilChanged(R.identical)
    .map(mapFn)
    .publishReplay(1)
    .refCount()

// TODO check how O.fromEvent is built. Do we need memoization?
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

// Unlike CycleJS sources and sinks can be of any type
export let makeIsolates = (templates) => {
  function isolate(app, appKey=null) {
    appKey = appKey || uid.sync(4)
    return function App(sources) {
      // Prepare sources
      let defaultSources = R.mapObjIndexed(
        (_, sourceKey) => templates[sourceKey].defaultSource(appKey),
        templates
      )
      let isolatedSources = R.mapObjIndexed(
        (source, sourceKey) =>
          templates[sourceKey].isolateSource(source, appKey),
        sources
      )
      let properSources = R.merge(defaultSources, isolatedSources)

      // Run app (unredux component)
      let sinks = app(properSources, appKey)

      // Prepare sinks
      let isolatedSinks = R.mapObjIndexed(
        (sink, sinkKey) =>
          templates[sinkKey].isolateSink(sink, appKey),
        sinks
      )
      let defaultSinks = R.mapObjIndexed(
        (_, sinkKey) => templates[sinkKey].defaultSink(appKey),
        templates
      )
      let properSinks = R.merge(defaultSinks, isolatedSinks)

      return properSinks
    }
  }

  function isolateSingle(busKey, app, appKey=null) {
    appKey = appKey || uid.sync(4)
    return function App(sources) {
      // Prepare sources
      let defaultSources = R.mapObjIndexed(
        (_, sourceKey) => templates[sourceKey].defaultSource(appKey),
        templates
      )
      let isolatedSources = R.mapObjIndexed(
        (source, sourceKey) => {
          return sourceKey == busKey
            ? templates[busKey].isolateSource(source, appKey)
            : source
        },
        sources
      )
      let properSources = R.merge(defaultSources, isolatedSources)

      // Run app (unredux component)
      let sinks = app(properSources, appKey)

      // Prepare sinks
      let isolatedSinks = R.mapObjIndexed(
        (sink, sinkKey) => {
          return sinkKey == busKey
            ? templates[sinkKey].isolateSink(sink, appKey)
            : sink
        },
        sinks
      )
      let defaultSinks = R.mapObjIndexed(
        (_, sinkKey) => templates[sinkKey].defaultSink(appKey),
        templates
      )
      let properSinks = R.merge(defaultSinks, isolatedSinks)

      return properSinks
    }
  }

  return {isolate, isolateSingle}
}

export function connect(streamsToProps, ComponentToWrap, hooks={}) {
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

export let defaultSources = {
  $: () => new ReplaySubject(1),
  DOM: () => {
    let DOM = {
      fromKey: () => DOM,
      from: () => DOM,
      listen: () => O.of(),
    }
    return DOM
  },
}

export let defaultSinks = {
  $: () => O.of(),

  DOM: () => {
    return (props) => null
  }
}

export let {isolate, isolateSingle} = makeIsolates({
  $: {
    isolateSource: (source, key) => {
      return source.pluck(lastKey(key))
    },

    isolateSink: (sink, key) => {
      return sink.map(command => {
        return {fn: R.over, args: [lastKey(key), command]}
      })
    },

    defaultSource: defaultSources.$,

    defaultSink: defaultSinks.$,
  },

  DOM: {
    isolateSource: (source, key) => {
      return source.fromKey(lastKey(key))
    },

    isolateSink: (sink, key) => {
      return (props) => <div data-key={lastKey(key)}>
        {React.createElement(sink, props)}
      </div>
    },

    defaultSource: defaultSources.DOM,

    defaultSink: defaultSinks.DOM,
  }
})

export let liftReact = (reactComponent) => {
  let unreduxComponent = R.merge({
    $: defaultSinks.$(),
    DOM: defaultSinks.DOM(),
  }, {
    DOM: reactComponent,
  })
  return unreduxComponent
}
