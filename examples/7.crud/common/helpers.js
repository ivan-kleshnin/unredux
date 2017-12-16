import generate from "nanoid/generate"

export let makeId = () => generate("0123456789abcdef", 10)
