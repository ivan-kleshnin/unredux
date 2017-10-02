// chan is both Subject and Function
export let chan = () => {
  let subj$ = new Subject()
  let fn = (...callArgs) => {
    return subj$.next(...callArgs)
  }
  Object.setPrototypeOf(fn, subj$) // slow, not a problem as calls are super rare (init time only)
  return fn
}

export let stateChan = () => {
  let subj$ = new ReplaySubject(1)
  let fn = (...callArgs) => {
    return subj$.next(...callArgs)
  }
  Object.setPrototypeOf(fn, subj$) // slow, not a problem as calls are super rare (init time only)
  return fn
}

// let c = chan()
//
// console.log((new Subject()).map)
// console.log(c.map)
//
// c.subscribe(x => {
//   console.log(x)
// })
//
// c(1)
// c(2)
// c(3)
