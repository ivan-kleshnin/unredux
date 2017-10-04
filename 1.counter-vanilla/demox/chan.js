// chan is both a Subject and a Function
// here it's a bit simplier, as we don't merge intents with actions
export let chan = () => {
  let subj = new Subject()
  let fn = function channel(...callArgs) {
    return subj.next(...callArgs)
  }
  Object.setPrototypeOf(fn, subj) // slow, not a problem as calls are super rare (init time only)
  return fn
}

export let stateChan = () => {
  let subj = new ReplaySubject(1)
  let fn = function stateChannel(...callArgs) {
    return subj.next(...callArgs)
  }
  Object.setPrototypeOf(fn, subj) // slow, not a problem as calls are super rare (init time only)
  return fn
}

// let c = chan()
// c.subscribe(x => {
//   console.log(x)
// })
//
// c(1) // instead of c.next(1)
// c(2) // instead of c.next(2)
// c(3) // instead of c.next(3)
