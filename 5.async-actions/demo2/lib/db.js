import {chan} from "./utils"

let COLLECTION = Symbol("collection")

let makeDB = (seed, options={}) => {
  let actions = R.reduce((z, k) => {
    let v = seed[k]
    if (R.isPlainObj(v) && v[COLLECTION]) {
      let meta = v[COLLECTION]
      return R.merge(z, {
        ["set" + meta.modelName]: chan($ => $
          .map(model => state => R.setL([k, id], model, state))
        ),

        ["update" + meta.modelName]: chan($ => $
          .map(model => state => R.overL([k, id], R.mergeFlipped(model), state))
        ),

        ["delete" + meta.modelName]: chan($ => $
          .map(id => state => R.setL([k, id], undefined, state))
        ),
      })
    } else {
      return z
    }
  }, {}, R.keys(seed))

  let state = store(seed, actions, options)

  let asyncActions = R.reduce((z, k) => {
    let v = seed[k]
    let modelName = capitalizeFirst(k)

    if (R.isPlainObj(v) && v[COLLECTION]) {
      let meta = v[COLLECTION]
      return R.merge(z, {
        ["load" + meta.modelName]: chan($ => $
          .withLatestFrom(db, async (id, db) => {
            if (db[k][id]) {
              console.log("cache hit: do nothing")
            } else {
              console.log("cache miss: fetch data")

              // TODO
              // GET /{k}/{id}
              // =>
              // GET /users/123,124,125,126

              // let foo = await getAsync("foo", 500)
              // let bar = await getAsync("bar", 500)
              actions["set" + modelName]({id})
            }
          })
        ),
      })
    } else {
      return z
    }
  }, {}, R.keys(seed))

  return {
    actions,
    state,
    $: state,
    asyncActions,
  }
}

makeDB.COLLECTION = COLLECTION

export default makeDB

let capitalizeFirst = (s) => s[0].toUpperCase() + s.slice(1)

