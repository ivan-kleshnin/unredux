import PT from "prop-types"
import React from "react"
import UserItem from "./UserItem"

export default function UserIndex({users}) {
  return <div data-key="userIndex">
    <h1>User Index</h1>
    <div>
      {users.length
        ? users.map(user =>
          <UserItem key={user.id} user={user}/>
        )
        : <p><i>No users available.</i></p>
      }
    </div>
  </div>
}

UserIndex.propTypes = {
  users: PT.arrayOf(UserItem.propTypes.user).isRequired,
}

