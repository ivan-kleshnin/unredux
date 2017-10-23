import {inspect} from "util"
import deepFreeze from "deep-freeze"
import * as R from "../ramda"
import {O, S} from "../rxjs"

// Async Helpers ===================================================================================

// Number -> Promise ()
export let delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

// Rx-Utils ========================================================================================

// Filter observable by another observable, truthy = keep
// filterBy :: Observable Boolean -> Observable a -> Observable a
export let filterBy = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(snd).map(fst)
}

// Filter observable by another observable, truthy = drop
// rejectBy :: Observable Boolean -> Observable a -> Observable a
export let rejectBy = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(R.complement(snd)).map(fst)
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

// State ===========================================================================================

let cmpFn = R.identical

let freezeFn = (v) => {
  return process.env.NODE_ENV != "production"
    ? (R.is(Object, v) ? deepFreeze(v) : v)
    : v
}

let assertJSONFn = (v) => {
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

let logFn = (key, args) => {
  if (process.env.NODE_ENV != "production")
    console.log(`@ ${key}(${args.map(inspect).join(", ")})`)
}

export let Atom = (seed, options={cmpFn, freezeFn, assertJSONFn}) => {
  let subj = new S()
  let $ = subj
   .startWith(options.freezeFn(options.assertJSONFn(seed)))
   .scan((prevState, fn) => {
      if (R.is(Function, fn)) {
        if (fn.length == 1) {
          let nextState = fn.call("$", prevState)
          options.assertJSONFn(nextState)
          return options.freezeFn(nextState)
        } else {
          throw Error(`dispatched value must be an unary function, got arity ${fn.length}`)
        }
      } else {
        throw Error(`dispatched value must be a function, got ${inspect(fn)}`)
      }
   })
   .distinctUntilChanged(options.cmpFn)
   .shareReplay(1)

  let get = () => {
    let state
    $.subscribe(s => {
      state = s
    }).unsubscribe()
    return state
  }

  let over = (fn) => {
    subj.next(fn)
    return get()
  }

  let atom = {$, get, over, derive: (lens) => LensedAtom(atom, lens)}
  return atom
}

export let LensedAtom = (atom, lens, options={cmpFn}) => {
  let $ = atom.$
    .map(R.view(lens))
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

export let Molecule = (atoms, mapFn, options={cmpFn}) => {
  let $ = combineLatestObj(R.pluck("$", atoms))
    .map(mapFn)
    // .debounceTime(1) // mute possible diamond cases
    .distinctUntilChanged(options.cmpFn)
    .shareReplay(1)

  let get = () => {
    let state
    $.subscribe(s => {
      state = s
    }).unsubscribe()
    return state
  }

  let over = (fn) => {
    atom.over(R.over(lens, fn))
    return get()
  }

  return R.merge(atoms, {$})
}

// Metaprogramming =================================================================================

export let logging = (fnObj, options={logFn}) => {
  return R.mapObjIndexed((fn, key) => {
    let _args = []
    if (fn.length == 1) {
      return (a1) => {
        options.logFn(key, [])
        return fn(a1)
      }
    } else if (fn.length == 2) {
      return R.curry((a1, a2) => {
        options.logFn(key, [a1])
        return fn(a1)
      })
    } else if (fn.length == 3) {
      return R.curry((a1, a2, a3) => {
        options.logFn(key, [a1, a2])
        return fn(a1)
      })
    } else if (fn.length == 4) {
      return R.curry((a1, a2, a3, a4) => {
        options.logFn(key, [a1, a2, a3])
        return fn(a1)
      })
    } else if (fn.length == 5) {
      return R.curry((a1, a2, a3, a4, a5) => {
        options.logFn(key, [a1, a2, a3, a4])
        return fn(a1)
      })
    } else {
      throw Error(`metaFn must be a function with arity in [1, 5], got ${fn.length}`)
    }
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

// export let logging = (fnObj) => {
//   return R.mapObjIndexed((fn, key) => {
//     let _args = []
//     function wrap(fn) {
//       return function proxy(...args) {
//         _args = _args.concat(args)
//         if (this == "$") {
//           console.log(`@ ${key}(${R.dropLast(1, _args).map(inspect).join(", ")})`)
//         }
//         let r = fn(...args)
//         if (R.is(Function, r)) {
//           return wrap(r)
//         } else {
//           return r
//         }
//       }
//     }
//     return wrap(fn)
//   }, fnObj)
