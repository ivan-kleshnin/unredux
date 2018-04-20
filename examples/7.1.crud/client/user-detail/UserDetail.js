import PT from "prop-types"
import React from "react"
import Loading from "../common/Loading"

export default function UserDetail({loading, user}) {
  return <div>
    <h1>User Detail</h1>
    {loading
      ? <Loading/>
      : <pre>
        {JSON.stringify(user, null, 2)}
      </pre>}
  </div>
}

UserDetail.propTypes = {
  loading: PT.bool.isRequired,
  user: PT.object,
}
