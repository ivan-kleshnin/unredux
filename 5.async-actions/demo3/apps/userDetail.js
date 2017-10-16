import makeBlueprint from "../blueprints/detail"
import * as main from "./main"

let {
  makeActions, makeSeed, makeState, makeAsyncActions
} = makeBlueprint(main, "User", "users")

export let actions = makeActions()

export let state = makeState(actions, {
  doFn: (s) => console.log("# userDetail state:", s)
})

export let asyncActions = makeAsyncActions(state, actions)

// OR
// doUseBlueprint(main, makeBlueprint(main, "User", "users"))
