import * as R from "ramda"
import {O, S} from "rxjs"

// chan is both an Observable and a Function
export let chan = (letFn) => {
  let subj = new S()
  let obs = letFn(subj)
  function channel(...callArgs) {
    return subj.next(callArgs[0]) // callArgs[1..n] are reserved
  }
  Object.setPrototypeOf(channel, obs)
  return channel
}
