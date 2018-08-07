import PT from "prop-types"
import React from "react"
import Loading from "../common/Loading"
import NotFound from "../common/NotFound"

export default function PostDetail({post, loading}) {
  return <div>
    <h1>Post Detail</h1>
    {post
      ? <pre>
          {JSON.stringify(post, null, 2)}
        </pre>
      : loading ? <Loading/> : <NotFound/>}
      {/* need something more generic than <NotFound/> here */}
  </div>
}

PostDetail.propTypes = {
  post: PT.object,
  loading: PT.bool.isRequired,
}
