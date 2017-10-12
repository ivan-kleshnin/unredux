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
