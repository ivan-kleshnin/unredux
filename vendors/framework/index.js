import React from "react"
import {Observable as O} from "rxjs"
import {combineLatestObj} from "rx-utils"
import * as R from "../ramda"

// TODO rx-utils candidate
export let init = (seed) =>
  O.of(R.fn("init", () => seed))

// TODO rx-utils candidate
export let derive = (lens, store, mapFn) =>
  store.$.map(R.view(lens))
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
export let makeIsolate = (template) =>
  R.curry((app, key) =>
    (sources) => {
      let isolatedSources = R.mapObjIndexed(
        (source, sourceType) =>
          template[sourceType].isolateSource(source, key),
        sources
      )
      let sinks = app(isolatedSources, key)
      let isolatedSinks = R.mapObjIndexed(
        (sink, sinkType) =>
          template[sinkType].isolateSink(sink, key),
        sinks
      )
      return isolatedSinks
    }
  )

export let connect = R.curryAs("connect", (streamsToProps, ComponentToWrap) =>{
  class Container extends React.Component {
    constructor(props) {
      super(props)
      this.state = {} // will be replaced with seed on componentWillMount
    }

    componentWillMount() {
      // console.log(`${Object.keys(streamsToProps)} container mounts!`)
      let props = combineLatestObj(streamsToProps)
        .throttleTime(10, undefined, {leading: true, trailing: true}) // RxJS throttle is half-broken (https://github.com/ReactiveX/rxjs/search?q=throttle&type=Issues)
      this.sb = props.subscribe((data) => {
        this.setState(data)
      })
    }

    componentWillUnmount() {
      // console.log(`${Object.keys(streamsToProps)} container unmounts!`)
      this.sb.unsubscribe()
    }

    render() {
      // TODO if this.state == {} return <div/> or Loading???
      return React.createElement(ComponentToWrap, R.merge(this.props, this.state), this.props.children)
    }
  }
  return Container
})
