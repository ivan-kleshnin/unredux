import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import addApp from "../add/app"
import indexApp from "../index/app"

export let seed = {
  todos: {}
}

export default (sources, key) => {
  let intents = {
    reset$: sources.DOM.fromKey("reset").listen("click")
      .do(({event}) => event.preventDefault())
      .mapTo(true),
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

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
    D.withLocalStoragePersistence({key}),
  )(
    D.init(seed),

    intents.reset$.map(_ => R.always(seed)),

    addSinks.action$,
    indexSinks.action$,
  ).$

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
