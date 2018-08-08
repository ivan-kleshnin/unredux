import * as R from "@paqmind/ramda"
import K from "kefir"
import "setimmediate"

////////////////////////////////////////////////////////////////////////////////////////////////////
global.R = R
////////////////////////////////////////////////////////////////////////////////////////////////////

// Temporal fix for https://github.com/kefirjs/kefir/issues/265
K.fromPromise = function fromPromise(promise) {
  let called = false

  let result = K.stream(function (emitter) {
    if (!called) {
      let onValue = function (x) {
        setImmediate(() => { // escape Promise catch
          emitter.emit(x)
          emitter.end()
        })
      }
      let onError = function (x) {
        setImmediate(() => { // escape Promise catch
          emitter.error(x)
          emitter.end()
        })
      }
      let _promise = promise.then(onValue).catch(onError)

      // prevent libraries like 'Q' or 'when' from swallowing exceptions
      if (_promise && typeof _promise.done === 'function') {
        _promise.done()
      }

      called = true
    }
  })

  return result.toProperty().setName("fromPromise")
}

K.fromProperty = function fromProperty(prop$) {
  return K.merge([K.later(0, prop$.take(1)).flatMap(), prop$.skip(1)])
}
