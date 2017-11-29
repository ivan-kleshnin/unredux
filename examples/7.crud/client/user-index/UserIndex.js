import PT from "prop-types"
import * as R from "ramda"
import React from "react"
import UserItem from "./UserItem"

export default function UserIndex({users, index}) {
  return <div data-key="userIndex">
    <h1>Users</h1>
    <div style={{marginBottom: "10px"}}>
      Fields: <code>id</code> (sort + filter){" "}
              <code>fullname</code> (sort + filter){" "}
              <code>dob</code> (sort + filter){" "}
    </div>
    <div style={{marginBottom: "10px"}}>
      Filter by:{" "}
      <label>
        Id{" "}
        <input type="text" name="filter.id" value={index.filter.id} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Fullname{" "}
        <input type="text" name="filter.fullname" value={index.filter.fullname} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Dob{" "}
        <input type="text" name="filter.dob" value={index.filter.dob} onChange={R.id}/>
      </label>
    </div>
    <div style={{marginBottom: "10px"}}>
      Sort by:
      {" "}
      <button name="sort" value="+id">
        {index.sort == "+id" ? <b>+id</b> : "+id"}
      </button>
      {" "}
      <button name="sort" value="+fullname">
        {index.sort == "+title" ? <b>+title</b> : "+title"}
      </button>
      {" "}
      <button name="sort" value="-id">
        {index.sort == "-id" ? <b>-id</b> : "-id"}
      </button>
      {" "}
      <button name="sort" value="-title">
        {index.sort == "-title" ? <b>-title</b> : "-title"}
      </button>
    </div>
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

