import PT from "prop-types"
import React from "react"
import * as M from "common/models"

export default function UserItem({user}) {
  return <pre>
    <strong>{user.id}</strong>: {JSON.stringify(user)} age: {M.age(user)}
  </pre>
}

UserItem.propTypes = {
  user: PT.object,
}
