import PT from "prop-types"
import React from "react"
import Loading from "../common/Loading"

export default function PostDetail({loading, post}) {
  return <div>
    <h1>Post Detail</h1>
    {loading
      ? <Loading/>
      : <pre>
        {JSON.stringify(post, null, 2)}
      </pre>}
  </div>
}

PostDetail.propTypes = {
  loading: PT.bool.isRequired,
  post: PT.object,
}
