import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import * as M from "../models"
import TodoForm from "./TodoForm"

export let seed = {
  text: "",
}

export default (sources, key) => {
  let intents = {
    inputText$: sources.DOM.from("input[name=text]").listen("input")
      .map(ee => ee.element.value),

    submitForm$: sources.DOM.from("form").listen("submit")
      .map(ee => (ee.event.preventDefault(), ee))
      .map(R.always(true)),
  }

  let form$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    D.init(seed),

    // Updates
    intents.inputText$.map(text => R.set2("text", text)),

    // Resets
    intents.submitForm$.delay(1).map(_ => R.always(seed)),
  ).$

  let action$ = form$.sampledBy(intents.submitForm$).map(form => {
    let todo = M.makeTodo({text: form.text})
    return R.set2(["todos", todo.id], todo)
  })

  let Component = F.connect(
    {todo: form$},
    TodoForm,
  )

  return {action$, Component}
}
