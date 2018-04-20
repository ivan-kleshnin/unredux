import {connect} from "framework"
import * as D from "kefir.db"
import {makeTodo} from "../models"
import TodoForm from "./TodoForm"

export let seed = {
  text: "",
}

export default (sources, {key}) => {
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
    intents.inputText$.map(text => function inputText(state) {
      return R.set2("text", text, state)
    }),

    // Resets
    intents.submitForm$.delay(1).map(_ => function reset(state) {
      return seed
    }),
  ).$

  let action$ = form$.sampledBy(intents.submitForm$).map(form => {
    let todo = makeTodo({text: form.text})
    return function addTodo(state) {
      return R.set2(["todos", todo.id], todo, state)
    }
  })

  let Component = connect(
    {todo: form$},
    TodoForm,
  )

  return {action$, Component}
}
