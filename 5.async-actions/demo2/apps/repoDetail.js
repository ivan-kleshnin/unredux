import makeBlueprint from "../blueprints/detail"
import * as main from "./main"

let {
  makeActions, makeSeed, makeState, makeAsyncActions
} = makeBlueprint("Repo", "repos")

export let actions = makeActions({})

export let seed = makeSeed({})

export let state = makeState(seed, main.pluck("repos"), actions, {
  doFn: (s) => console.log("# repoDetail state:", s)
})

export let asyncActions = makeAsyncActions({})
