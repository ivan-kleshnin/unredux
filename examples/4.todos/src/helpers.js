import * as R from "ramda"

let c = 0

export let nextId = () => {
  return String(++c)
}

export let makeTodo = (data) => {
  return R.merge({
    id: data.id ? data.id : nextId(),
    text: data.text,
    completed: false,
    addedAt: new Date().toISOString(),
  }, data)
}
