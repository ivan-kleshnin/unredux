import PT from "prop-types"
import React from "react"

export default function UserItem({user}) {
  return <pre>
    <strong>{user.id}</strong>: {JSON.stringify(user)}
  </pre>
}

UserItem.propTypes = {
  user: PT.object,
}
