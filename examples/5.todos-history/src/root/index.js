import {isolateDOM} from "vendors/framework"
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

  let addSinks = isolateDOM(addApp, "add")(sources, {})
  let indexSinks = isolateDOM(indexApp, "index")(sources, {})
  let historySinks = isolateDOM(historyApp, "history")(sources, {})

  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),                                                    // 1) this logger is aware of history
    D.withLocalStoragePersistence({key: "5.todos-history.root"}),        // 3) this storage is aware of history
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
