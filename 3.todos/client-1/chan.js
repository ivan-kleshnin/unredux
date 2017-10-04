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
