import * as R from "ramda"
import React from "react"
import {makeIsolate} from "framework"

// Unlike CycleJS, sinks and sources can be of any type. You manage them here.
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
  }
})
