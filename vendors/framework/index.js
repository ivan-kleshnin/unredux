import React from "react"
import {Observable as O} from "rxjs"
import {combineLatestObj} from "rx-utils"
import * as R from "../ramda"
import uid from "uid-safe"

// TODO rx-utils candidate
export let init = (seed) =>
  O.of(R.fn("init", () => seed))

// TODO rx-utils candidate
export let derive = (lens, state$, mapFn) =>
  state$.map(R.view(lens))
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
        return collectFn([...selectors, `[data-key="${key}"]`]) // TODO overspecific?
      },
      listen: (eventName) => {
        return O.fromEvent(document.querySelector(appSelector), eventName)
          .throttleTime(10, undefined, {leading: true, trailing: true})
          .filter(event => {
            return event.target.matches(R.join(" ", selectors))
          })
          .map(event => {
            let dataset = event.target.dataset
            return dataset.val ? dataset.val : event // TODO overspecific?
          }).share()
      }
    }
  }
  return collectFn([appSelector])
}

// Unlike CycleJS sources and sinks can be of any type
export let makeIsolate = (templates) =>
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
