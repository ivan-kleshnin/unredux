import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import * as D from "selfdb"
import * as F from "framework"

export default (sources, key) => {
  let intents = {
    // unsubscribed on state unsubscribe which happens on willUnmount
    click: sources.DOM.from("button").listen("click")
  }

  let state = R.run(
    () => D.makeStore({name: key + ".page1.counter"}),
    D.withLog({}),
    D.withMemoryPersistence({key: key + ".page1.counter"}),
  )(O.merge(
    F.init(0),
    intents.click.map(_ => R.inc),
  ))

  let DOM = F.connect(
    {counter: state.$},
    (props) =>
      <div>Page 1: {props.counter} <button>Click!</button></div>
  )

  return {DOM}
}
