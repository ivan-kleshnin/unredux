import * as R from "@paqmind/ramda"
import PT from "prop-types"
import React from "react"
import Loading from "../common/Loading"
import UserItem from "./UserItem"

export default function UserIndex({loading, index, users}) {
  return <div data-key="userIndex">
    <h1 className="title">Users</h1>
    <details className="margin-bottom-sm">
      <summary>Fields</summary>
      <code>id: filters, sort</code><br/>
      <code>fullname: filters, sort</code><br/>
      <code>role: filters</code><br/>
      <code>birthDate: filters, sort</code><br/>
    </details>
    <div className="clearfix margin-bottom-sm">
      <div className="pull-left">
        <label>
          Id<br/>
          <input type="text" name="filters.id" value={index.filters.id} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Fullname<br/>
          <input type="text" name="filters.fullname" value={index.filters.fullname} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Role<br/>
          <input type="text" name="filters.role" value={index.filters.role} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Age From<br/>
          <input type="text" name="filters.ageFrom" value={index.filters.ageFrom} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Age To<br/>
          <input type="text" name="filters.ageTo" value={index.filters.ageTo} onChange={R.id}/>
        </label>
      </div>
    </div>
    <div className="clearfix">
      <div className="pull-left">
        Sort by:<br/>
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
    </div>
    {loading
      ? <Loading/>
      : <div className="margin-top">
        {users.length
          ? users.map(user =>
              <UserItem key={user.id} user={user}/>
            )
          : <p><i>No users available.</i></p>
        }
      </div>
    }
  </div>
}

UserIndex.propTypes = {
  loading: PT.bool.isRequired,
  index: PT.object,
  users: PT.arrayOf(UserItem.propTypes.user),
}

