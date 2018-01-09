import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import addApp from "../todo-add"
import indexApp from "../todo-index"
import historyApp from "../todo-history"

export let seed = {
  todos: {}
}

export default (sources, key) => {
  let intents = {
    reset$: sources.DOM.fromKey("reset").listen("click")
      .map(ee => (ee.event.preventDefault(), ee))
      .map(R.always(true)),
  }

  /*
  Non-isolated apps are aware of root sources:
    * they can access and modify the root state
    * they can query root DOM events
    * their DOM sources and action$ sinks can name-clash
  Such apps are fine as parts of the bigger app, but probably less fine as libraries.
  Different keys can still be used for logging purposes.
  */
  let addSinks = addApp(sources, key + ".add")
  let indexSinks = indexApp(sources, key + ".index")
  let historySinks = historyApp(sources, key + ".index")

  let state$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),                                              // 1) this logger is aware of history
    D.withLocalStoragePersistence({key: "5.todos-history_1." + key}), // 3) this storage is aware of history
    D.withHistory({}),
    D.withLog({key}),                        // 2) this logger is unaware of history
    // D.withLocalStoragePersistence({key: "5.todos-history_2." + key}), // 4) this storage is unaware of history
  )(
    D.init(seed),

    intents.reset$.map(_ => R.always(seed)),

    addSinks.action$,
    indexSinks.action$,
    historySinks.action$,
  ).$

  let Component = (props) =>
    <div>
     <addSinks.Component/>
     <indexSinks.Component/>
     <historySinks.Component/>
     <div>
       <a href="#reset" data-key="reset">Reset</a>
     </div>
   </div>

  return {state$, Component}
}
