// Boolean -> Boolean
export let not = (x) => !x

// [a] -> a
export let fst = (xs) => xs[0]

// [a] -> a
export let snd = (xs) => xs[1]

// Object -> Boolean
export let isPlainObj = (o) => Boolean(
  o && o.constructor && o.constructor.prototype && o.constructor.prototype.hasOwnProperty("isPrototypeOf")
)

// Object -> Object
export let flattenObj = (obj, keys=[]) => {
  return Object.keys(obj).reduce((acc, key) => {
    return Object.assign(acc, isPlainObj(obj[key])
      ? flattenObj(obj[key], keys.concat(key))
      : {[keys.concat(key).join(".")]: obj[key]}
    )
  }, {})
}
