import {connect} from "vendors/framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {validate} from "tcomb-validation"
import {fetchJSON} from "common/helpers"
import * as T from "common/types"
import PostForm from "./PostForm"

// SEED
export let seed = {
  input: {
    title: "",
    text: "",
    tags: "",
    isPublished: false,
  },
  errors: {},
}

export default (sources, {key}) => {
  let baseLens = ["posts"]

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

    // Reset on submit
    intents.submit$
      .delay(1)
      .map(_ => ({input}) => {
        let res = validate(input, T.PostForm)
        if (res.isValid()) {
          return seed
        } else {
          let errors = R.reduce((z, k) => {
            let err = R.find(e => R.equals(e.path, [k]), res.errors)
            return err ? R.set2(k, err.message, z) : z
          }, {}, R.keys(input))
          return {input, errors}
        }
      }),
  ).$

  // COMPONENT
  let Component = connect(
    {
      form: form$,
    },
    ({form}) =>
      <PostForm input={form.input} errors={form.errors}/>
  )

  // ACTIONS
  let action$ = K.merge([
    K.constant(function initPage(state) {
      return R.set2(["document", "title"], `Post Create`, state)
    }),

    form$
      .sampledBy(intents.submit$)
      .flatMapConcat(form => {
        let postForm
        try {
          postForm = T.PostForm(form.input)
        } catch (e) {
          return K.never()
        }
        return K.constant(postForm)
      })
      .flatMapConcat(form => K.fromPromise(
        A.post(`/api/${baseLens[0]}/`, form)
         .then(resp => resp.data.model)
         .catch(R.id)
      ))
      .map(maybeModel => function afterPOST(state) {
        return maybeModel instanceof Error
          ? state
          : R.set2([...baseLens, maybeModel.id], maybeModel, state)
      }),
  ])

  return {Component, action$}
}
