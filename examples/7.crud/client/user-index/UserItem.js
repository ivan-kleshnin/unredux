import PT from "prop-types"
import React from "react"
import {age} from "common/types/User"

export default function UserItem({user}) {
  return <pre>
    {user.id}: {JSON.stringify(user)} age: {age(user)}
  </pre>
}

UserItem.propTypes = {
  user: PT.object,
}
