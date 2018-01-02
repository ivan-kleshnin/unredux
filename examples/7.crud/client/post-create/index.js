import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {validate} from "tcomb-validation"
import * as T from "common/types"
import PostForm from "./PostForm"

export let seed = {
  input: {
    title: "",
    text: "",
    tags: "",
    isPublished: false,
  },
  errors: {},
}

export default (sources, key) => {
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

  let form$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init(seed),

    intents.changeTitle$.map(x => R.set(["input", "title"], x)),
    intents.changeTitle$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.title)
      return res.isValid()
        ? R.unset(["errors", "title"])
        : R.set(["errors", "title"], res.firstError().message)
    }),

    intents.changeText$.map(x => R.set(["input", "text"], x)),
    intents.changeText$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.text)
      return res.isValid()
        ? R.unset(["errors", "text"])
        : R.set(["errors", "text"], res.firstError().message)
    }),

    intents.changeTags$.map(x => R.set(["input", "tags"], x)),
    intents.changeTags$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.tags)
      return res.isValid()
        ? R.unset(["errors", "tags"])
        : R.set(["errors", "tags"], res.firstError().message)
    }),

    intents.changeIsPublished$.map(x => R.set(["input", "isPublished"], x)),
    intents.changeIsPublished$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.isPublished)
      return res.isValid()
        ? R.unset(["errors", "isPublished"])
        : R.set(["errors", "isPublished"], res.firstError().message)
    }),

    // Resets
    intents.submit$.delay(1).map(_ => (form) => {
      let res = validate(form.input, T.PostForm)
      if (res.isValid()) {
        return seed
      } else {
        let errors = R.reduce((z, key) => {
          let e = R.find(e => R.equals(e.path, [key]), res.errors)
          return e ? R.set(key, e.message, z) : z
        }, {}, R.keys(form.input))
        return R.set("errors", errors, form)
      }
    }),
  ).$

  let action$ = K.merge([
    form$.sampledBy(intents.submit$).flatMapConcat(form => {
      let postForm
      try {
        postForm = T.PostForm(form.input)
      } catch (e) {
        return K.never()
      }
      return K.constant(postForm)
    }).flatMapConcat(form => K
      .fromPromise(A.post(`/api/posts/`, form))
      .map(resp => resp.data.model)
    )
    .map(post => {
      return function afterPOST(state) {
        return R.set(["posts", post.id], post, state)
      }
    }).flatMapErrors(err => {
      console.warn(`Request to "${err.response.config.url}" failed with message "${err.response.status} ${err.response.statusText}"`)
      return K.never() // TODO add alert box
    })
  ])

  let Component = F.connect(
    {
      form: form$,
    },
    ({form}) =>
      <PostForm input={form.input} errors={form.errors}/>
  )

  return {action$, Component}
}
