import * as R from "@paqmind/ramda"
import nanoid from "nanoid"

export let makeTodo = (data) => {
  return R.merge({
    id: data.id ? data.id : nanoid(4),
    text: data.text,
    completed: false,
    addedAt: new Date().toJSON(),
  }, data)
}

export let isCompleted = (t) => t.completed

export let isActive = (t) => !t.completed
