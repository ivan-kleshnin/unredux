// chan is both an Observable and a Function
export default (mapFn) => {
  let subj = new Subject()
  let obs = subj.map(mapFn)
  let fn = function channel(...callArgs) {
    return subj.next(...callArgs)
  }
  Object.setPrototypeOf(fn, obs) // slow, not a problem as calls are super rare (init time only)
  return fn
}

// let c = chan(x => y => x * y))
// c.subscribe(fn => {
//   console.log(fn(10)) // x is an event argument, y is state
// })
//
// c(1) // instead of c.next(1)
// c(2) // instead of c.next(2)
// c(3) // instead of c.next(3)

////////////////////////////////////////////////////////////////////////////////////////////////////
// The code above is equivalent to this:

// let s = new Subject()
// let o = s.map(x => x * 2)
// o.subscribe(x => {
//   console.log(x)
// })
// s.next(1)
// s.next(2)
// s.next(3)
