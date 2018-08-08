import PT from "prop-types"
import React from "react"
import Loading from "../common/Loading"

export default function PostDetail({post, loading}) {
  return <div>
    <h1>Post Detail</h1>
    {post
      ? <pre>
          {JSON.stringify(post, null, 2)}
        </pre>
      : loading ? <Loading/> : <p>No data yet.</p>}
  </div>
}

PostDetail.propTypes = {
  post: PT.object,
  loading: PT.bool.isRequired,
}
