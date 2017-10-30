import * as R from "ramda"
import {makeIsolate} from "./lib"

// Unlike CycleJS sinks and sources can be of any type
export let isolate = makeIsolate({
  $: {
    isolateSink: (sink, key) => {
      return sink.pluck(key)
    },

    isolateSource: (source, key) => {
      return source.map(command => {
        return {fn: R.over, args: [key, command]}
      })
    },
  },

  DOM: {
    isolateSink: (sink, key) => {
      return sink(key)
    },

    isolateSource: (source, key) => {
      let Component = source
      return (props) => <div data-key={key}>
        <Component {...props}/>
      </div>
    },
  }
})
