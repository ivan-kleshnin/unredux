import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import {makeIsolate} from "framework"

// Unlike CycleJS, sinks and sources can be of any type. You manage them here.
let defaultSources = {
  $: () => O.of(),
  DOM: () => {
    let DOM = {
      fromKey: () => DOM,
      from: () => DOM,
      listen: () => O.of(),
    }
    return DOM
  },
}

let defaultSinks = {
  $: () => O.of(),

  DOM: () => {
    return () => null
  }
}

export let isolate = makeIsolate({
  $: {
    isolateSource: (source, key) => {
      return source.pluck(key)
    },

    isolateSink: (sink, key) => {
      return sink.map(command => {
        return {fn: R.over, args: [key, command]}
      })
    },

    defaultSource: defaultSources.$,

    defaultSink: defaultSinks.$,
  },

  DOM: {
    isolateSource: (source, key) => {
      return source.fromKey(key)
    },

    isolateSink: (sink, key) => {
      let Component = sink
      return (props) => <div data-key={key}>
        <Component {...props}/>
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
