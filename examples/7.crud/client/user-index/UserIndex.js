import PT from "prop-types"
import * as R from "ramda"
import React from "react"
import UserItem from "./UserItem"

export default function UserIndex({users, index}) {
  return <div data-key="userIndex">
    <h1>Users</h1>
    <details className="margin-bottom-sm">
      <summary>Fields</summary>
      <code>id</code> – sort & filter<br/>
      <code>fullname</code> – sort & filter<br/>
      <code>role</code> – sort & filter<br/>
      <code>birthDate</code> – sort & filter
    </details>
    <div className="clearfix margin-bottom-sm">
      <div className="pull-left">
        <label>
          Id<br/>
          <input type="text" name="filter.id" value={index.filter.id} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Fullname<br/>
          <input type="text" name="filter.fullname" value={index.filter.fullname} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Role<br/>
          <input type="text" name="filter.role" value={index.filter.role} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Age From<br/>
          <input type="text" name="filter.ageFrom" value={index.filter.ageFrom} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Age To<br/>
          <input type="text" name="filter.ageTo" value={index.filter.ageTo} onChange={R.id}/>
        </label>
      </div>
    </div>
    <div className="clearfix">
      <div className="pull-left">
      Sort by:
      <br/>
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
      </button></div>
    </div>
    <div className="margin-top">
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

