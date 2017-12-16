import PT from "prop-types"
import * as R from "ramda"
import React from "react"
import UserItem from "./UserItem"

export default function UserIndex({users, index}) {
  return <div data-key="userIndex">
    <h1>Users</h1>
    <div style={{marginBottom: "10px"}}>
      Used Fields: <code>id</code> (sort + filters){" "}
        <code>fullname</code> (sort + filters){" "}
        <code>role</code> (filters){" "}
        <code>birthDate</code> (sort + filters)
    </div>
    <div style={{marginBottom: "10px"}}>
      Filter by:{" "}
      <label>
        Id{" "}
        <input type="text" name="filters.id" value={index.filters.id} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Fullname{" "}
        <input type="text" name="filters.fullname" value={index.filters.fullname} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Role{" "}
        <input type="text" name="filters.role" value={index.filters.role} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Age From{" "}
        <input type="text" name="filters.ageFrom" value={index.filters.ageFrom} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Age To{" "}
        <input type="text" name="filters.ageTo" value={index.filters.ageTo} onChange={R.id}/>
      </label>
    </div>
    <div style={{marginBottom: "10px"}}>
      Sort by:
      {" "}
      <button name="sort" value={index.sort == "+id" ? "-id" : "+id"}>
        {index.sort == "+id" ? <span><b>&uarr; Id</b></span> :
         index.sort == "-id" ? <span><b>&darr; Id</b></span> :
                               <span>&uarr; Id</span>
        }
      </button>
      {" "}
      <button name="sort" value={index.sort == "+fullname" ? "-fullname" : "+fullname"}>
        {index.sort == "+fullname" ? <span><b>&uarr; Fullname</b></span> :
         index.sort == "-fullname" ? <span><b>&darr; Fullname</b></span> :
                                     <span>&uarr; Fullname</span>
        }
      </button>
      {" "}
      <button name="sort" value={index.sort == "+birthDate" ? "-birthDate" : "+birthDate"}>
        {index.sort == "+birthDate" ? <span><b>&darr; Age</b></span> :
         index.sort == "-birthDate" ? <span><b>&uarr; Age</b></span> :
                                      <span>&darr; Age</span>
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

