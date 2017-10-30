import * as R from "ramda"
import {Observable as O} from "rxjs"
import {combineLatestObj} from "rx-utils"

// TODO check how O.fromEvent is built. Do we need memoization?
export let fromDOMEvent = R.curry((appSelector, componentSelector, elementSelector, eventName) => {
  return O.fromEvent(document.querySelector(appSelector), eventName)
    .throttleTime(10, undefined, {leading: true, trailing: true})
    .filter(event => {
      return event.target.matches(`${componentSelector} ${elementSelector}`)
    }).share()
})

export let fromDOMEventSTD = R.curry((appKey, componentKey, elementKey, eventName) => {
  let appSelector = "#" + appKey
  let componentSelector = `[data-key="${componentKey}"]`
  let elementSelector = `[data-key="${elementKey}"]`
  return fromDOMEvent(appSelector, componentSelector, elementSelector, eventName)
    .map(event => {
      return event.target.dataset.val
        ? event.target.dataset.val
        : true
    }).share()
})

// Unlike CycleJS sinks and sources can be of any type
export let makeIsolate = (template) =>
  R.curry((app, key) =>
    (sinks) => {
      let isolatedSinks = R.mapObjIndexed(
        (sink, sinkType) =>
          template[sinkType].isolateSink(sink, key),
        sinks
      )
      let sources = app(isolatedSinks, key)
      let isolatedSources = R.mapObjIndexed(
        (source, sourceType) =>
          template[sourceType].isolateSource(source, key),
        sources
      )
      return isolatedSources
    }
  )

export let connect = R.curry((streamsToProps, ComponentToWrap) =>{
  class Container extends React.Component {
    constructor(props) {
      super(props)
      this.state = {} // will be replaced with seed on componentWillMount
    }

    componentWillMount() {
      let props = combineLatestObj(streamsToProps)
        .throttleTime(10, undefined, {leading: true, trailing: true}) // RxJS throttle is half-broken (https://github.com/ReactiveX/rxjs/search?q=throttle&type=Issues)
      this.sb = props.subscribe((data) => {
        this.setState(data)
      })
    }

    componentWillUnmount() {
      this.sb.unsubscribe()
    }

    render() {
      return React.createElement(ComponentToWrap, R.merge(this.props, this.state), this.props.children)
    }
  }
  return Container
})
