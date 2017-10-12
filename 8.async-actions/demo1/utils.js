// Promises ========================================================================================

// (a, Number?) -> Promise a
export let getAsync = (val, delay=500) => {
  return new Promise((resolve, reject) => setTimeout(() => resolve(val), delay))
}

// Number -> Promise ()
export let delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

// Observables =====================================================================================

// Filter observable by another observable, truthy = keep
// :: Observable Boolean -> Observable a -> Observable a
export let filterBy = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(snd).map(fst)
}

// Filter observable by another observable, truthy = drop
// :: Observable Boolean -> Observable a -> Observable a
export let rejectBy = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(R.complement(snd)).map(fst)
}

// :: Object (Observable *) -> Observable *
export let mergeObj = (obj) => {
  obj = R.flattenObj(obj)
  let values = R.values(obj) // streams
  return O.merge(...values)
}

// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js
// :: Object (Observable *) -> Observable *
export let combineLatestObj = (obj) => {
  obj = R.flattenObj(obj)
  let keys = R.keys(obj)     // stream names
  let values = R.values(obj) // streams
  return O.combineLatest(values, (...args) => {
    return R.zipObj(keys, args)
  })
}

// Framework =======================================================================================

// chan is both an Observable and a Function
export let chan = (mapFn) => {
  let subj = new Subject()
  let obs = mapFn(subj)
  function channel(...callArgs) {
    if (callArgs.length <= 1) {
      return subj.next(callArgs[0])
    } else {
      return subj.next(callArgs)
    }
  }
  Object.setPrototypeOf(channel, obs)
  return channel
}

// useful for state loops (no examples so far)
export let stateChan = () => {
  let subj = new ReplaySubject(1)
  function channel(...callArgs) {
    if (callArgs.length <= 1) {
      return subj.next(callArgs[0])
    } else {
      return subj.next(callArgs)
    }
  }
  Object.setPrototypeOf(channel, subj)
  return channel
}
