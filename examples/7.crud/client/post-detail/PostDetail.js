import PT from "prop-types"
import React from "react"

export default function PostDetail({post}) {
  return <div>
    <h1>Post Detail</h1>
    <pre>
      {JSON.stringify(post, null, 2)}
    </pre>
  </div>
}

PostDetail.propTypes = {
  post: PT.object.isRequired,
}
