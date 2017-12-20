import * as R from "ramda"
import T from "tcomb"

export let limitedString = (min, max) => {
  let LimitedString = T.refinement(
    T.String,
    (s) => s.length >= 1 && s.length <= 200
  )
  LimitedString.getValidationErrorMessage = (s) => {
    if (s.length < min) {
      return "Value is required!"
    }
    if (s.length >= max) {
      return "Value is too long!"
    }
  }
  return LimitedString
}

export let formattedString = (regex) => {
  let formattedString = T.refinement(
    T.String,
    (s) => s.match(regex)
  )
  // TODO error message
  return formattedString
}
