import * as R from "ramda"
import {Observable as O} from "rxjs"
import * as D from "selfdb"
import * as F from "framework"
import {makeTodo} from "../helpers"
import Form from "./form"

export default (sources, key) => {
  let intents = {
    inputText$: sources.DOM.from("input[name=text]").listen("input")
      .map(event => event.target.value),

    submitForm$: sources.DOM.from("form").listen("submit")
      .do(event => event.preventDefault())
      .mapTo(true),
  }

  let seed = {
    text: "",
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({name: key}),
  )(O.merge(
    F.init(seed),

    // Updates
    intents.inputText$.map(text => R.set("text", text)),

    // Resets
    intents.submitForm$.delay(1).map(_ => R.always(seed)),
  )).$

  let $ = O.merge(
    state$.sample(intents.submitForm$).map(form => {
      let todo = makeTodo({text: form.text})
      return R.set(["todos", todo.id], todo)
    }),
  )

  let DOM = F.connect(
    {text: state$.pluck("text")},
    Form,
  )

  return {$, DOM}
}
