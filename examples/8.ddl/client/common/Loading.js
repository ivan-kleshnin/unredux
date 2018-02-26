import React from "react"

export default function Loading({flag}) {
  return flag
    ? <p>Loading...</p>
    : <p>No data to display!</p>
}
