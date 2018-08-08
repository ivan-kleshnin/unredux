import DT from "date-fns"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {validate} from "tcomb-validation"
import {connect, derive} from "vendors/framework"
import {fetchJSON} from "common/helpers"
import * as T from "common/types"
import {incLoading, decLoading} from "../blueprints"
import Form from "./Form"

// SEED
export let seed = {
  input: {
    title: "",
    text: "",
    tags: "",
    isPublished: false,
    publishDate: "",
  },
  errors: {},
}

export default (sources, {key, params}) => {
  let baseLens = ["posts", params.id]

  let deriveState = derive(sources.state$.throttle(50))
  let post$ = deriveState(baseLens)

  // INTENTS
  let intents = {
    changeTitle$: sources.DOM.fromName("title").listen("input")
      .map(ee => ee.element.value),

    changeText$: sources.DOM.fromName("text").listen("input")
      .map(ee => ee.element.value),

    changeTags$: sources.DOM.fromName("tags").listen("input")
      .map(ee => ee.element.value),

    changeIsPublished$: sources.DOM.fromName("isPublished").listen("click")
      .map(ee => ee.element.checked),

    changePublishDate$: sources.DOM.fromName("publishDate").listen("input")
      .map(ee => ee.element.value),

    submit$: sources.DOM.from("form").listen("submit")
      .map(ee => (ee.event.preventDefault(), ee))
      .map(R.always(true)),
  }

  // STATE
  let form$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    // Init
    D.init(seed),

    // Form
    intents.changeTitle$.map(x => R.set2(["input", "title"], x)),
    intents.changeTitle$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.title)
      return res.isValid()
        ? R.unset2(["errors", "title"])
        : R.set2(["errors", "title"], res.firstError().message)
    }),

    intents.changeText$.map(x => R.set2(["input", "text"], x)),
    intents.changeText$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.text)
      return res.isValid()
        ? R.unset2(["errors", "text"])
        : R.set2(["errors", "text"], res.firstError().message)
    }),

    intents.changeTags$.map(x => R.set2(["input", "tags"], x)),
    intents.changeTags$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.tags)
      return res.isValid()
        ? R.unset2(["errors", "tags"])
        : R.set2(["errors", "tags"], res.firstError().message)
    }),

    intents.changeIsPublished$.map(x => R.set2(["input", "isPublished"], x)),
    intents.changeIsPublished$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.isPublished)
      return res.isValid()
        ? R.unset2(["errors", "isPublished"])
        : R.set2(["errors", "isPublished"], res.firstError().message)
    }),

    intents.changePublishDate$.map(x => R.set2(["input", "publishDate"], x)),
    intents.changePublishDate$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.publishDate)
      return res.isValid()
        ? R.unset2(["errors", "publishDate"])
        : R.set2(["errors", "publishDate"], res.firstError().message)
    }),

    // Follow state model
    post$
      .filter(Boolean)
      .map(post => state => {
        // Model -> Form formatting
        let input = {
          ...post,
          tags: R.join(", ", post.tags),
          publishDate: DT.format(post.publishDate, "YYYY-MM-DD"),
        }
        let res = validate(input, T.PostForm)
        if (res.isValid()) {
          let errors = {}
          return R.merge(state, {input, errors})
        } else {
          let errors = R.reduce((z, k) => {
            let err = R.find(e => R.equals(e.path, [k]), res.errors)
            return err ? R.set2(k, err.message, z) : z
          }, {}, R.keys(input))
          return R.merge(state, {input, errors})
        }
      }),

    // Validate on submit
    intents.submit$
      .map(_ => (state) => {
        let errors = {}
        let res = validate(state.input, T.PostForm)
        if (!res.isValid()) {
          errors = R.reduce((z, k) => {
            let err = R.find(e => R.equals(e.path, [k]), res.errors)
            return err ? R.set2(k, err.message, z) : z
          }, {}, R.keys(state.input))
        }
        return R.merge(state, {errors})
      }),
  ).$

  // COMPONENT
  let Component = connect({form: form$}, Form)

  // ACTIONS
  let action$ = K.merge([
    post$
      .filter(R.not)
      .flatMapConcat(_ => K.stream(async (emitter) => {
        emitter.value(function fetchStarted(state) {
          return incLoading(state)
        })

        let reqResult = await fetchJSON(`/api/${baseLens.join("/")}/`)
        if (reqResult instanceof Error) {
          console.warn(reqResult.message)
          emitter.value(function fetchFailed(state) {
            // + Set your custom alerts here
            return decLoading(state)
          })
        } else {
          let post = reqResult.models[params.id]
          emitter.value(function fetchSucceeded(state) {
            return R.pipe(
              R.set2(baseLens, post),
              decLoading,
            )(state)
          })
        }

        return emitter.end()
      })),

    form$
      .sampledBy(intents.submit$)
      .filter(form => R.isEmpty(form.errors))
      .flatMapConcat(form => K.stream(async (emitter) => {
        emitter.value(function fetchStarted(state) {
          return incLoading(state)
        })

        let reqResult = await fetchJSON(`/api/${baseLens.join("/")}/`, {
          method: "PUT",
          body: form.input,
        })

        if (reqResult instanceof Error) {
          console.warn(reqResult.message)
          emitter.value(function fetchFailed(state) {
            // + Set your custom alerts here
            return decLoading(state)
          })
        } else {
          let post = reqResult.model // Update after PUT (can contain new data)
          emitter.value(function afterFetch(state) {
            return R.pipe(
              R.set2(baseLens, post),
              decLoading,
            )(state)
          })
        }

        return emitter.end()
      })),
  ])

  return {Component, action$}
}
