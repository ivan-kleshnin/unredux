import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"
import {makeTodo} from "../helpers"
import AddApp from "../add/AddApp"
import IndexApp from "../index/IndexApp"

export default (sources, key) => {
  let addApp = F.isolateNone(AddApp, key + ".AddApp")(sources)
  let indexApp = F.isolateNone(IndexApp, key + ".IndexApp")(sources)

  let firstTodo = makeTodo({text: "Prepare..."})
  let seed = {
    todos: {
      [firstTodo.id]: firstTodo,
    },
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({name: key}),
  )(O.merge(
    F.init(seed),

    addApp.$,
    indexApp.$,
  )).$

  state$.subscribe(sources.$)

  let DOM = (props) =>
    <div>
     <addApp.DOM/>
     <indexApp.DOM/>
   </div>

  return {DOM}
}
