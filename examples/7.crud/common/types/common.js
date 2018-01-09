import * as R from "@paqmind/ramda"
import T from "tcomb"

export let nullable = (type) => {
  type.fromJSON = (x) => {
    return x ? x : null
  }
  return type
}

export let dateTime = () => {
  let Type = T.refinement(
    T.String,
    (s) => /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ/.test(s)
  )
  Type.getValidationErrorMessage = (s) => {
    if (!s.length) {
      return "Value is required!"
    }
    return "Value is invalid!"
  }
  return Type
}

export let limitedString = (min, max) => {
  let Type = T.refinement(
    T.String,
    (s) => s.length >= min && s.length <= max
  )
  Type.getValidationErrorMessage = (s) => {
    if (s.length < min) {
      return "Value is required!"
    }
    if (s.length >= max) {
      return "Value is too long!"
    }
  }
  return Type
}

export let formattedString = (regex) => {
  let Type = T.refinement(
    T.String,
    (s) => regex.test(s)
  )
  Type.getValidationErrorMessage = (s) => {
    if (!s.length) {
      return "Value is required!"
    }
    return "Value is invalid!"
  }
  return Type
}

export let tagString = () => {
  let Type = T.refinement(
    T.String,
    (s) => /^[\w.]{1,20}$/.test(s) // up to 20 chars
  )
  Type.getValidationErrorMessage = (s) => {
    if (!s.length) {
      return "Value is required!"
    }
    return "Value is invalid!"
  }
  return Type
}

export let tagsString = () => {
  let Type = T.refinement(
    T.String,
    (s) => {
      return /^([\w.]{1,20})?(, [\w.]{1,20}){0,4}$/.test(s) // up to 5 tags, up to 20 chars each
    }
  )
  Type.getValidationErrorMessage = (s) => {
    if (!s.length) {
      return "Value is required!"
    }
    return "Value is invalid!"
  }
  return Type
}
