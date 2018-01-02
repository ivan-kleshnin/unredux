import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {validate} from "tcomb-validation"
import * as T from "common/types"
import * as B from "../blueprints"
import PostForm from "./PostForm"

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

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["posts", params.id]

  let intents = {
    fetch$: sources.state$
      .filter(s => !R.view(baseLens, s))
      .thru(B.fetchModel(baseLens)),

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

    intents.changePublishDate$.map(x => R.set(["input", "publishDate"], x)),
    intents.changePublishDate$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.publishDate)
      return res.isValid()
        ? R.unset(["errors", "publishDate"])
        : R.set(["errors", "publishDate"], res.firstError().message)
    }),

    // Resets
    sources.state$.map(R.view(["posts", params.id])).filter(Boolean).map(post => function initFromRoot() {
      let input = {
        title: post.title,
        text: post.text,
        tags: R.join(", ", post.tags),
        isPublished: post.isPublished,
        publishDate: post.publishDate,
      }
      let res = validate(input, T.PostForm)
      if (res.isValid()) {
        let errors = {}
        return {input, errors}
      } else {
        let errors = R.reduce((z, key) => {
          let e = R.find(e => R.equals(e.path, [key]), res.errors)
          return e ? R.set(key, e.message, z) : z
        }, {}, R.keys(input))
        return {input, errors}
      }
    }),
  ).$

  let Component = F.connect(
    {
      form: form$,
    },
    ({form}) =>
      <PostForm input={form.input} errors={form.errors}/>
  )

  let action$ = K.merge([
    intents.fetch$.thru(B.postFetchModel(baseLens)),

    form$.sampledBy(intents.submit$).flatMapConcat(form => {
      let postForm
      try {
        postForm = T.PostForm(form.input)
      } catch (e) {
        return K.never()
      }
      return K.constant(postForm)
    })
    .thru(B.editModel(baseLens))
    .thru(B.postEditModel(baseLens))
  ])

  return {Component, action$}
}
