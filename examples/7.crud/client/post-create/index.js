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
    // tags: "",
    // isPublished: false,
    // publishDate: "", // TODO timestamp vs ISOString (pros and cons)
  },
  errors: {},
}

export default (sources, key) => {
  let intents = {
    changeTitle$: sources.DOM.fromName("title").listen("input")
      .map(ee => ee.element.value),

    changeText$: sources.DOM.fromName("text").listen("input")
      .map(ee => ee.element.value),

    // changeTags$: sources.DOM.fromName("tags").listen("input")
    //   .map(ee => ee.element.value),
    //
    // changeIsPublised$: sources.DOM.fromName("isPublished").listen("click")
    //   .map(ee => ee.element.checked),
    //
    // changePublishDate$: sources.DOM.fromName("publishDate").listen("input")
    //   .map(ee => ee.element.value),

    submit$: sources.DOM.from("form").listen("submit")
      .map(ee => (ee.event.preventDefault(), ee))
      .map(R.always(true)),
  }

  let form$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    D.init(seed),

    intents.changeTitle$.map(x => {
      let res = validate(x, T.Post.meta.props.title)
      return R.pipe(
        R.set(["input", "title"], x),
        res.isValid()
          ? R.unset(["errors", "title"])
          : R.set(["errors", "title"], res.firstError().message)
      )
    }),

    intents.changeText$.map(x => {
      let res = validate(x, T.Post.meta.props.text)
      return R.pipe(
        R.set(["input", "text"], x),
        res.isValid()
          ? R.unset(["errors", "text"])
          : R.set(["errors", "text"], res.firstError().message)
      )
    }),

    // intents.changeTags$.map(x => {
    //   let res = validate(x, T.Post.meta.props.tags)
    //   return R.pipe(
    //     R.set("text", x),
    //     res.isValid()
    //       ? R.unset(["errors", "title"])
    //       : R.set(["errors", "tags"], res.firstError().message)
    //   )
    // }),
    // intents.changeIsPublished$.map(x => R.set("isPublished", x)),
    // intents.changePublishDate$.map(x => R.set("publishDate", x)),

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

  let action$ = form$.sampledBy(intents.submit$).flatMapConcat(form => {
    let postForm
    try {
      postForm = T.PostForm(form.input)
    } catch (e) {
      return K.never()
    }
    return K.constant(postForm)
  }).flatMapConcat(form => {
    return K.fromPromise(A.post("/api/posts/", form).then(resp => resp.data.model))
  }).map(post => {
    return function afterPOST(state) {
      return R.set(["posts", post.id], post, state)
    }
  }).flatMapErrors(err => {
    console.warn(`Request to "${err.response.config.url}" failed with message "${err.response.status} ${err.response.statusText}"`)
    return K.never() // TODO add alert box
  })

  let Component = F.connect(
    {
      form: form$,
    },
    ({form}) =>
      <PostForm input={form.input} errors={form.errors}/>
  )

  return {action$, Component}
}
