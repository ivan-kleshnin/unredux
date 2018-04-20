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

  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
    D.withLocalStoragePersistence({key: "4.todos." + key}),
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
