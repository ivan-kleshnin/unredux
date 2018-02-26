import PT from "prop-types"
import React from "react"

export default function UserItem({user}) {
  return <pre>
    {JSON.stringify(user)}
  </pre>
}

UserItem.propTypes = {
  // post: PT.object.isRequired,
  user: PT.object.isRequired,
}
