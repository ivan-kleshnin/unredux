// chan is both an Observable and a Function
export let chan = (mapFn) => {
  let subj = new Subject()
  let obs = mapFn(subj)
  function channel(...callArgs) {
    return subj.next(...callArgs)
  }
  Object.setPrototypeOf(channel, obs) // slow, not a problem as calls are init time only
  return channel
}

export let stateChan = () => {
  let subj = new ReplaySubject(1)
  function channel(...callArgs) {
    return subj.next(...callArgs)
  }
  Object.setPrototypeOf(channel, subj) // slow, not a problem as calls are init time only
  return channel
}
