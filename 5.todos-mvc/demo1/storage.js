export let loadFromStorage = (key, defaultState) => {
  try {
    let cachedState = JSON.parse(localStorage.getItem(key))
    if (R.isEmpty(cachedState)) {
      return defaultState
    } else {
      return cachedState
    }
  } catch (err) {
    console.warn("error at read from localStorage")
    return defaultState
  }

}

export let saveToStorage = (key, state) => {
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch (err) {
    console.warn("error at write to localStorage")
  }
}
