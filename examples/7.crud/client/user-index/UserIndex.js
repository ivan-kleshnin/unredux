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
      <code>dob</code> – sort & filter<br/>
      <code>role</code> – sort & filter
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
          Dob<br/>
          <input type="text" name="filter.dob" value={index.filter.dob} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Role<br/>
          <input type="text" name="filter.role" value={index.filter.role} onChange={R.id}/>
        </label>
      </div>
    </div>
    <div className="clearfix">
      <div className="pull-left">
        Sort by:<br/>
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
