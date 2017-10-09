// chan is both an Observable and a Function
// export default (mapFn) => {
//   let subj = new Subject()
//   let obs = subj.map(mapFn)
//   let fn = function channel(...callArgs) {
//     return subj.next(...callArgs)
//   }
//   Object.setPrototypeOf(fn, obs) // slow, not a problem as calls are super rare (init time only)
//   return fn
// }

// Still can't support static calls like `Observable.merge(...)`
export default (mapFn) => {
  let subj = new Subject()
  let obs = subj.map(mapFn)
  let linkToSubj = (obj) => {
    return new Proxy(() => obj, {
      get: (target, propName, _) => {
        let obs = target()
        return (typeof obs[propName] == "function")
          ? (...args) => {
            let res = obs[propName](...args)
            return res instanceof Observable
              ? linkToSubj(res) // observable methods making a new observable now make a new proxied observable
              : res             // other observable methods behave as usual
          }
          : obs[propName]
      },
      apply: (target, _, args) => {
        subj.next(...args)
      }
    })
  }
  return linkToSubj(obs)
}
