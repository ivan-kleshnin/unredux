import * as R from "ramda"
import uid from "uid-safe"

export let makeTodo = (data) => {
  return R.merge({
    id: data.id ? data.id : uid.sync(4),
    text: data.text,
    completed: false,
    addedAt: new Date().toISOString(),
  }, data)
}

export let makeAdd = () => {
  return {
    text: "",
  }
}

export let makeIndex = () => {
  return {
    filterFn: R.id,
    sortFn: R.fn("sortByAddedAt", R.ascend(R.prop("addedAt"))),
  }
}

export let makeRoot = () => {
  return {
    todos: {}
  }
}

export let isCompleted = (t) => t.completed

export let isActive = (t) => !t.completed
