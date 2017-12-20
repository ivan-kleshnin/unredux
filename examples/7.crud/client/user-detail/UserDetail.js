import PT from "prop-types"
import React from "react"

export default function UserDetail({user}) {
  return <div data-key="userDetail">
    <h1>User Detail</h1>
    <pre>
      {JSON.stringify(user, null, 2)}
    </pre>
  </div>
}

UserDetail.propTypes = {
  user: PT.object.isRequired,
}
