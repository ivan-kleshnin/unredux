import PT from "prop-types"
import React from "react"

export default function UserItem({user}) {
  return <p>
    {user.id} {user.fullname} {user.email}
    {" "}
    <button data-key="buy" data-val={user.id} disabled={!false ? true : null}>
      Do something
    </button>
  </p>
}

UserItem.propTypes = {
  user: PT.object,
}
