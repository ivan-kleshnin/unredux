"use strict";

let R = require("./vendors/ramda")
let {inspect} = require("util")
let {Observable, Subject} = require("rxjs")
let deepFreeze = require("deep-freeze")

let combineLatestObj = (obj) => {
  let keys = R.keys(obj)     // stream names
  let values = R.values(obj) // streams
  return Observable.combineLatest(values, (...args) => {
    return R.zipObj(keys, args)
  })
}

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

let Atom = (seed, options={cmpFn, freezeFn, assertJSONFn}) => {
  let subj = new Subject()
  let $ = subj
   .startWith(options.freezeFn(options.assertJSONFn(seed)))
   .scan((prevState, mapFn) => {
      if (R.is(Function, mapFn)) {
        let nextState = mapFn(prevState)
        options.assertJSONFn(nextState)
        return options.freezeFn(nextState)
      } else {
        throw Error(`invalid mapFn ${inspect(mapFn)} dispatched`)
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

let LensedAtom = (atom, lens, options={cmpFn}) => {
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

  let lensedAtom = {$, get, over, derive: (lens) => LensedAtom(lensedAtom, lens)}
  return lensedAtom
}

let Molecule = (atoms, mapFn, options={cmpFn}) => {
  let $ = combineLatestObj(R.pluck("$", atoms))
    .map(mapFn)
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

let logging = (fnObj) => {
  return R.mapObjIndexed((reduceFn, key) => {
    return (...args) => {
      let mapFn = reduceFn(...args)
      if (R.is(Function, mapFn)) {
        console.log(`@ ${key}(${JSON.stringify(args).slice(1, -1)})`)
        return mapFn
      } else {
        throw Error(`reduceFn has to produce mapFn, got ${inspect(mapFn)}`)
      }
    }
  }, fnObj)
}

////////////////////////////////////////////////////////////////////////////////////////////////////

let db = Atom({
  users: {
    "1": {id: "1"},
    "2": {id: "2"},
  },
})

db.$.subscribe(s => console.log("db:", s))

// Case 1: User-Detail =============================================================================

let userDetail = Molecule(
  {
    models: db.derive(["users"]),
    id: Atom(null),
  },
  ({models, id}) => {
    return models[id]
  }
)

let reducers = logging({
  setId: (id) => (state) => id,
})

userDetail.$.subscribe(s => console.log("userDetail:", s))

userDetail.id.over(reducers.setId("1"))
userDetail.id.over(reducers.setId("2"))
userDetail.id.over(reducers.setId(null))

// Case 2: User-Index ==============================================================================

let userIndex = Molecule(
  {
    models: db.derive(["users"]),
    ids: Atom([]),
  },
  ({models, ids}) => {
    return R.values(R.pick(ids, models)) // no sorting/filtering for now
  }
)

let reducers2 = logging({
  setIds: (ids) => (state) => ids,
})

userIndex.$.subscribe(s => console.log("userIndex:", s))

userIndex.ids.over(reducers2.setIds(["1"]))
userIndex.ids.over(reducers2.setIds(["2"]))
userIndex.ids.over(reducers2.setIds(["1", "2"]))
