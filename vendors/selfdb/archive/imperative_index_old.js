import {inspect} from "util"
import deepFreeze from "deep-freeze"
import * as R from "../ramda"
import {O, RS, S} from "../rxjs"

// Async Helpers ===================================================================================

// Number -> Promise ()
export let delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

// Rx-Utils ========================================================================================

let sndComplement = R.complement(R.snd)

// Filter observable by another observable, pass values on gate = 1
// passIfHigh :: Observable Boolean -> Observable a -> Observable a
export let passIfHigh = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(R.snd).map(R.fst)
}

// Filter observable by another observable, pass values on gate = 0
// passIfLow :: Observable Boolean -> Observable a -> Observable a
export let passIfLow = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(sndComplement).map(R.fst)
}

// Filter observable by another observable, pass values on gate = 1, including 1 to 0 switch
// passIfUp :: Observable Boolean -> Observable a -> Observable a
export let passIfUp = (obs) => (self) => {
  return self.combineLatest(obs).filter(R.snd).map(R.fst)
}

// Filter observable by another observable, pass values on gate = 0, including 1 to 0 switch
// passIfDown :: Observable Boolean -> Observable a -> Observable a
export let passIfDown = (obs) => (self) => {
  return self.combineLatest(obs).filter(sndComplement).map(R.fst)
}

// mergeObj :: Object (Observable *) -> Observable *
export let mergeObj = (obj) => {
  obj = R.flattenObj(obj)
  let values = R.values(obj) // streams
  return O.merge(...values)
}

// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js
// combineLatestObj :: Object (Observable *) -> Observable *
export let combineLatestObj = (obj) => {
  let keys = R.keys(obj)     // stream names
  let values = R.values(obj) // streams
  return O.combineLatest(values, (...args) => {
    return R.zipObj(keys, args)
  })
}

// mergeObjTracking :: Object (Observable *) -> Observable {key :: String, value :: *}
export let mergeObjTracking = (obj) => {
  obj = R.mapObjIndexed((value, key) => {
    return value.map(data => ({key, data}))
  }, obj)
  let values = R.values(obj) // streams
  return O.merge(...values)
}

// Atom ============================================================================================

let cmpFn = R.identical

let freezeFn = (v) => {
  return process.env.NODE_ENV != "production"
    ? (R.is(Object, v) ? deepFreeze(v) : v)
    : v
}

let assertFn = (v) => {
  if (process.env.NODE_ENV != "production") {
    let v2
    try {
      v2 = JSON.parse(JSON.stringify(v))
      if (R.equals(v, v2)) {
        return v
      }
    } catch (err) {
      // break
    }
    throw Error(`state must be JSON-serializable, got ${inspect(v)}`)
  }
  return v
}

let atomCount = 0
let moleculeCount = 0

export let Atom = (seed, options={}) => {
  options = R.merge({cmpFn, freezeFn, assertFn}, options)

  let _v = undefined
  let subj = new S()
  let $ = subj
   .startWith(options.freezeFn(options.assertFn(seed)))
   .scan((prevState, fn) => {
      if (R.is(Function, fn)) {
        let nextState = fn.call("$", prevState)
        return options.freezeFn(options.assertFn(nextState))
      } else {
        throw Error(`dispatched value must be a function, got ${inspect(fn)}`)
      }
   })
   .let(passIfDown(lock))
   // .filter(x => x != Atom.mute)
   .distinctUntilChanged(options.cmpFn)
   .do(v => {
     _v = v
   })
   .shareReplay(1)

  let logSubj = new S()
  let log$ = logSubj.map(x => x)

  let get = () => {
    return _v
  }

  // over :: (State -> State) -> State
  let over = (fn) => {
    logSubj.next({op: "over", args: [fn]})
    subj.next(fn)
    return get()
  }

  // set :: State -> State
  let set = (val) => {
    logSubj.next({op: "set", args: [val]})
    subj.next(R.always(val))
  }

  // merge :: StateFragment -> State
  let merge = (val) => {
    logSubj.next({op: "merge", args: [val]})
    subj.next(R.mergeFlipped(val))
  }

  // mergeDeep :: StateFragment -> State
  let mergeDeep = (val) => {
    logSubj.next({op: "mergeDeep", args: [val]})
    subj.next(R.mergeDeepFlipped(val))
  }

  // lensedOver :: Lens -> (State -> State) -> State
  let lensedOver = (lens, fn) => {
    logSubj.next({op: "lensedOver", args: [lens, fn]})
    subj.next(R.over(lens, fn))
    return get()
  }

  // lensedSet :: (Lens, State) -> State
  let lensedSet = (lens, val) => {
    logSubj.next({op: "lensedSet", args: [lens, val]})
    subj.next(R.over(lens, R.always(val)))
  }

  // lensedMerge :: (Lens, StateFragment) -> State
  let lensedMerge = (lens, val) => {
    logSubj.next({op: "lensedMerge", args: [lens, val]})
    subj.next(R.over(lens, R.mergeFlipped(val)))
  }

  // lensedMergeDeep :: (Lens, StateFragment) -> State
  let lensedMergeDeep = (lens, val) => {
    logSubj.next({op: "lensedMergeDeep", args: [lens, val]})
    subj.next(R.over(lens, R.mergeDeepFlipped(val)))
  }

  let logging = () => {
    $.subscribe(s => console.log("# db:", s))
    log$.subscribe(({op, args}) => {
      console.log()
    })
    return atom
  }

  let atom = {
    // streams
    $, log$,

    // getters/setters
    get, over, set, merge, mergeDeep,
    lensedOver, lensedSet, lensedMerge, lensedMergeDeep,

    // special
    derive: (lens) => LensedAtom(atom, lens),
    logging,
  }
  return atom
}

// Atom.mute = Symbol("mute")

let logFn = (prefix, key, args, auto) => {
  if (process.env.NODE_ENV != "production") {
    if (auto) {
      console.log(`  @ ${(prefix ? prefix + "::" : "") + key}(${args.map(inspect).join(", ")})`)
    } else {
      console.log(`@ ${(prefix ? prefix + "::" : "") + key}(${args.map(inspect).join(", ")})`)
    }
  }
}

export let LensedAtom = (atom, lens, options={}) => {
  options = R.merge({cmpFn}, options)
  let $ = atom.$
    .map(R.view(lens))
    .let(passIfDown(lock))
    // .filter(x => x != Atom.mute)
    .distinctUntilChanged(options.cmpFn)
    .shareReplay(1)

  let get = () => {
    return R.view(lens, atom.get())
  }

  let over = (fn) => {
    atom.over(R.over(lens, fn))
    return get()
  }

  let lensedAtom = {$, get, over, derive: (lens) => LensedAtom(lensedAtom, lens, options)}
  return lensedAtom
}

export let Molecule = (atoms, mapFn, options={}) => {
  options = R.merge({cmpFn}, options)
  let $ = combineLatestObj(R.pluck("$", atoms))
    .map(mapFn)
    // .debounceTime(1) // mute possible diamond cases
    .let(passIfDown(lock))
    // .filter(x => x != Atom.mute)
    .distinctUntilChanged(options.cmpFn)
    .shareReplay(1)

  return R.merge(atoms, {$})
}

// Other ===========================================================================================

export let logging = (fnObj, options={}) => {
  options = R.merge({logFn, prefix: ""}, options)
  return R.mapObjIndexed((fn, key) => {
    function wrap(fn, _args, auto=false) {
      function proxy(...args) {
        if (this == "$") {
          let realArgs = R.dropLast(1, _args.concat(args))
          logFn(options.prefix, key, realArgs, auto)
        }
        let r = fn(...args)
        if (R.is(Function, r)) {
          if (this == "@") {
            return wrap(r, _args.concat(args), true)
          } else {
            return wrap(r, _args.concat(args), auto)
          }
        } else {
          return r
        }
      }
      proxy.auto = (...args) => proxy.apply("@", args)
      return proxy
    }
    return wrap(fn, [], false)
  }, fnObj)
}

// Experimental ====================================================================================

// chan :: (Observable a -> Observable b) -> Observable (State -> State)
// chan :: a -> Promise State
export let chan = (letFn) => {
  let subj = new S()
  function channel(...callArgs) {
    if (callArgs.length <= 1) {
      subj.next(callArgs[0]) // no return value
    }
    else {
      subj.next(callArgs) // no return value
    }
  }
  let obs = letFn(subj)
  Object.setPrototypeOf(channel, obs)      // support basic calls
  channel.apply = Function.prototype.apply // support spreads
  return channel
}

let lockSubj = new RS(1)
let lock = lockSubj
  .startWith(0)
  .scan((z, fn) => fn(z))
  .distinctUntilChanged(R.identical)
  .shareReplay(1)

export let holding = (fn) => {
  lockSubj.next(c => c + 1)
  try {
    return fn()
  } finally {
    lockSubj.next(c => c - 1)
  }
}

// Prev. get version
// let get = () => {
//   let state
//   $.subscribe(s => {
//     state = s
//   }).unsubscribe()
//   return state
// }

// export let logging = (fnObj, options={}) => {
//   options = R.merge({logFn, prefix: ""}, options)
//   return R.mapObjIndexed((fn, key) => {
//     function wrap(fn, _args, auto=false) {
//       function proxy(...args) {
//         if (this == "$") {
//           let realArgs = R.dropLast(1, _args.concat(args))
//           logFn(options.prefix, key, realArgs, auto)
//         }
//         let r = fn(...args)
//         if (R.is(Function, r)) {
//           if (this == "@") {
//             return wrap(r, _args.concat(args), true)
//           } else {
//             return wrap(r, _args.concat(args), auto)
//           }
//         } else {
//           return r
//         }
//       }
//       proxy.auto = (...args) => proxy.apply("@", args)
//       return proxy
//     }
//     return wrap(fn, [], false)
//   }, fnObj)
// }
