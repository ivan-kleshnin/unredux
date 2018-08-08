import {isolateDOM} from "vendors/framework"
import * as D from "kefir.db"
import React from "react"
import addApp from "../todo-add"
import indexApp from "../todo-index"

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

  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
    D.withLocalStoragePersistence({key: "4.todos.root"}),
  )(
    D.init(seed),

    intents.reset$.map(_ => function reset(state) {
      return seed
    }),

    addSinks.action$,
    indexSinks.action$,
  ).$

  // COMPONENT
  let Component = (props) =>
    <div>
     <addSinks.Component/>
     <indexSinks.Component/>
     <div>
       <a href="#reset" data-key="reset">Reset</a>
     </div>
   </div>

  return {state$, Component}
}
