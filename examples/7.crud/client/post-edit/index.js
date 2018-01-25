import * as R from "@paqmind/ramda"
import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {validate} from "tcomb-validation"
import * as T from "common/types"
import * as B from "../blueprints"
import PostForm from "./PostForm"

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

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["posts", params.id]
  let loadingLens = ["_loading", key]

  let loading$ = D.deriveOne(sources.state$, loadingLens).map(Boolean)
  let post$ = D.deriveOne(sources.state$, baseLens)

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

    fetch: {
      base$: post$.filter(R.not),
    }
  }

  // FETCHES
  let fetches = {
    base$: intents.fetch.base$
      .flatMapConcat(_ => K.fromPromise(
        A.get(`/api/${baseLens[0]}/${baseLens[1]}/`)
         .then(resp => resp.data.models[baseLens[1]])
         .catch(R.id)
      )),
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
      .map(post => () => {
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
            return e ? R.set2(key, e.message, z) : z
          }, {}, R.keys(input))
          return {input, errors}
        }
      }),
  ).$

  // COMPONENT
  let Component = F.connect(
    {
      loading: loading$,
      form: form$,
    },
    PostForm
  )

  // ACTION
  let action$ = K.merge([
    fetches.base$
      .map(maybeModel => function afterGET(state) {
        return maybeModel instanceof Error
          ? state
          : R.set2(baseLens, maybeModel, state)
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
        A.put(`/api/${baseLens[0]}/${baseLens[1]}/`, form)
         .then(resp => resp.data.model)
         .catch(R.id)
      ))
      .map(maybeModel => function afterPUT(state) {
        return maybeModel instanceof Error
          ? state
          : R.set2(baseLens, maybeModel, state)
      }),

    K.merge(R.values(intents.fetch)).map(R.K(R.over2(loadingLens, B.safeInc))),
    K.merge(R.values(fetches)).delay(1).map(R.K(R.over2(loadingLens, B.safeDec))),
  ])

  return {Component, action$}
}
