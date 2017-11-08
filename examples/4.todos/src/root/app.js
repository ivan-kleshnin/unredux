import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"
import * as M from "../models"
import addApp from "../add/app"
import indexApp from "../index/app"

export default (sources, key) => {
  /*
  Non-isolated apps are aware of root sources:
    * they can access and modify the root state
    * they can query root DOM events
  Such apps are fine as parts of the bigger app, but probably less fine as libraries.
  Different keys can still be used for logging purposes.
  */
  let addSinks = addApp(sources, key + ".add")
  let indexSinks = indexApp(sources, key + ".index")

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
    D.withLocalStoragePersistence({key}),
  )(O.merge(
    D.init(M.makeRoot()),

    addSinks.action$,
    indexSinks.action$,
  )).$

  let Component = (props) =>
    <div>
     <addSinks.Component/>
     <indexSinks.Component/>
   </div>

  return {state$, Component}
}
