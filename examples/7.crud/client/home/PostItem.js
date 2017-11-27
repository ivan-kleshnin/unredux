import PT from "prop-types"
import React from "react"

export default function PostItem({post}) {
  return <pre>
    {post.id}: {JSON.stringify(post)}
  </pre>
}

PostItem.propTypes = {
  post: PT.object,
}
