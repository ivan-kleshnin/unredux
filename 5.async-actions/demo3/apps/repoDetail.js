import makeBlueprint from "../blueprints/detail"
import * as main from "./main"

let {
  makeActions, makeSeed, makeState, makeAsyncActions
} = makeBlueprint(main, "Repo", "repos")

export let actions = makeActions()

export let state = makeState(actions, {
  doFn: (s) => console.log("# repoDetail state:", s)
})

export let asyncActions = makeAsyncActions(state, actions)

// OR
// doUseBlueprint(main, makeBlueprint(main, "Repo", "repos"))
