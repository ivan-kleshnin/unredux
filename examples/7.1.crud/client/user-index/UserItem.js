import PT from "prop-types"
import React from "react"
import {age} from "common/types/User"

export default function UserItem({user}) {
  return <pre>
    <a href={`/users/${user.id}/`}><i className="fa fa-eye"></i></a>{" "}
    <a href={`/users/edit/${user.id}/`}><i className="fa fa-edit"></i></a>{" "}
    {JSON.stringify(user)} age: {age(user)}
  </pre>
}

UserItem.propTypes = {
  user: PT.object,
}
