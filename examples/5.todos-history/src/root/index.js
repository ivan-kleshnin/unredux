import * as D from "kefir.db"
import React from "react"
import addApp from "../todo-add"
import indexApp from "../todo-index"
import historyApp from "../todo-history"

// SEED
export let seed = {
  todos: {}
}

export default (sources, {key}) => {
  // INTENTS
  let intents = {
    reset$: sources.DOM.fromKey("reset").listen("click")
      .map(ee => (ee.event.preventDefault(), ee))
      .map(R.always(true)),
  }

  /*
  Non-isolated apps are aware of root sources:
    * they see the root state and can modify it
    * they see all DOM events
    * name clashing cases has to prevented by a programmer
  Such apps are fine as parts of a bigger app, but not as libraries.
  */
  // Nested apps, different keys are used for logging purposes.
  let addSinks = addApp(sources, {key: "add"})
  let indexSinks = indexApp(sources, {key: "index"})
  let historySinks = historyApp(sources, {key: "history"})

  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),                                                    // 1) this logger is aware of history
    D.withLocalStoragePersistence({key: "5.todos-history_1." + key}),    // 3) this storage is aware of history
    D.withHistory({}),
    // D.withLog({key}),                                                 // 2) this logger is unaware of history
    // D.withLocalStoragePersistence({key: "5.todos-history_2." + key}), // 4) this storage is unaware of history
  )(
    D.init(seed),

    intents.reset$.map(_ => function reset(state) {
      return seed
    }),

    addSinks.action$,
    indexSinks.action$,
    historySinks.action$,
  ).$

  // COMPONENT
  let Component = (props) =>
    <div>
     <addSinks.Component/>
     <indexSinks.Component/>
     <historySinks.Component/>
     <div>
       <br/>
       <a href="#reset" data-key="reset">Reset</a>
     </div>
   </div>

  return {state$, Component}
}
