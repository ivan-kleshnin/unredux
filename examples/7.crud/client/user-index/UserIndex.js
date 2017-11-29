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
              <code>role</code> (sort + filter){" "}
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
      {" "}
      <label>
        Role{" "}
        <input type="text" name="filter.role" value={index.filter.role} onChange={R.id}/>
      </label>
    </div>
    <div style={{marginBottom: "10px"}}>
      Sort by:
      {" "}
      <button name="sort" value={index.sort == "+id" ? "-id" : "+id"}>
        {index.sort == "+id" ? <span><b>&uarr; id</b></span> :
         index.sort == "-id" ? <span><b>&darr; id</b></span> :
                               <span>&uarr; id</span>
        }
      </button>
      {" "}
      <button name="sort" value={index.sort == "+fullname" ? "-fullname" : "+fullname"}>
        {index.sort == "+fullname" ? <span><b>&uarr; fullname</b></span> :
         index.sort == "-fullname" ? <span><b>&darr; fullname</b></span> :
                                     <span>&uarr; fullname</span>
        }
      </button>
      {" "}
      <button name="sort" value={index.sort == "+dob" ? "-dob" : "+dob"}>
        {index.sort == "+dob" ? <span><b>&uarr; dob</b></span> :
         index.sort == "-dob" ? <span><b>&darr; dob</b></span> :
                                <span>&uarr; dob</span>
        }
      </button>
      {" "}
      <button name="sort" value={index.sort == "+role" ? "-role" : "+role"}>
        {index.sort == "+role" ? <span><b>&uarr; role</b></span> :
         index.sort == "-role" ? <span><b>&darr; role</b></span> :
                                 <span>&uarr; role</span>
        }
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

