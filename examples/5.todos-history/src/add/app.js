import * as R from "ramda"
import {Observable as O} from "rxjs"
import * as D from "selfdb"
import * as F from "framework"
import * as M from "../models"
import Form from "./form"

export let seed = {
  text: "",
}

export default (sources, key) => {
  let intents = {
    inputText$: sources.DOM.from("input[name=text]").listen("input")
      .map(R.view(["element", "value"])),

    submitForm$: sources.DOM.from("form").listen("submit")
      .do(({event}) => event.preventDefault())
      .mapTo(true),
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    D.init(seed),

    // Updates
    intents.inputText$.map(text => R.set("text", text)),

    // Resets
    intents.submitForm$.delay(1).map(_ => R.always(seed)),
  ).$

  let action$ = O.merge(
    state$.sample(intents.submitForm$).map(form => {
      let todo = M.makeTodo({text: form.text})
      return R.set(["todos", todo.id], todo)
    }),
  )

  let Component = F.connect(
    {text: state$.pluck("text")},
    Form,
  )

  return {action$, Component}
}
