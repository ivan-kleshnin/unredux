import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import React from "react"

export default (sources, key) => {
  let intents = {
    // unsubscribed on state unsubscribe which happens on willUnmount
    inc$: sources.DOM.fromKey("inc").listen("click").map(R.always(true)),
    dec$: sources.DOM.fromKey("dec").listen("click").map(R.always(true)),
  }

  let action$ = K.merge([
    intents.inc$.map(_ => R.over2("page3", R.inc)),
    intents.dec$.map(_ => R.over2("page3", R.dec)),
  ])

  let Component = F.connect(
    {counter: sources.state$.map(s => s.page3)},
    ({counter}) =>
      <div>
        Page 3: {counter} <button data-key="inc">+1</button> <button data-key="dec">-1</button>
        <p><i>Root State persistence (memory)</i></p>

        <p>
          <a href="#h4.1">Scroll down to H4.1</a><br/>
          <a href="#h4.2">Scroll down to H4.2</a><br/>
          <a href="#h4.3">Scroll down to H4.3</a><br/>
          <a href="#h4.4">Scroll down to H4.4</a><br/>
        </p>

        <h4 id="h4.1">H4.1</h4>
        <pre dangerouslySetInnerHTML={{__html: `
          a
          b
          c
          d
          e
          f
          g
          h
          i
          j
          k
          l
          m
          n
          o
          p
          q
          r
          s
          t
          u
          v
          w
          x
          y
          z
        `}}></pre>

        <h4 id="h4.2">H4.2</h4>
        <pre dangerouslySetInnerHTML={{__html: `
          a
          b
          c
          d
          e
          f
          g
          h
          i
          j
          k
          l
          m
          n
          o
          p
          q
          r
          s
          t
          u
          v
          w
          x
          y
          z
        `}}></pre>

        <h4 id="h4.3">H4.3</h4>
        <pre dangerouslySetInnerHTML={{__html: `
          a
          b
          c
          d
          e
          f
          g
          h
          i
          j
          k
          l
          m
          n
          o
          p
          q
          r
          s
          t
          u
          v
          w
          x
          y
          z
        `}}></pre>

        <h4 id="h4.4">H4.4</h4>
        <pre dangerouslySetInnerHTML={{__html: `
          a
          b
          c
          d
          e
          f
          g
          h
          i
          j
          k
          l
          m
          n
          o
          p
          q
          r
          s
          t
          u
          v
          w
          x
          y
          z
        `}}></pre>

        <p>
          <a href="#h4.1">Scroll up to H4.1</a><br/>
          <a href="#h4.2">Scroll up to H4.2</a><br/>
          <a href="#h4.3">Scroll up to H4.3</a><br/>
          <a href="#h4.4">Scroll up to H4.4</a><br/>
        </p>
      </div>
  )

  return {action$, Component}
}
