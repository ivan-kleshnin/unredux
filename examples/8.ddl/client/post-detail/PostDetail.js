import PT from "prop-types"
import React from "react"
import Loading from "common/Loading"

export default function PostDetail({subset, loading, post, user}) {
  return <div data-key="postDetail">
    <h1>Post Detail</h1>
    <div>
      {!post
        ? <Loading flag={loading[`${subset}/posts`]}></Loading>
        : <pre>{JSON.stringify(post, null, 2)}</pre>
      }
    </div>
    <h3>User</h3>
    <div>
      {!user
        ? <Loading flag={loading[`${subset}/posts`] || loading[`${subset}/users`]}></Loading>
        : <pre>{JSON.stringify(user, null, 2)}</pre>
      }
    </div>
  </div>
}

PostDetail.propTypes = {
  loading: PT.object.isRequired,
  post: PT.object,
  user: PT.object,
}
