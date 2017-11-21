import PT from "prop-types"
import React from "react"

export default function PostItem({post}) {
  return <p>
    {post.id} {post.title}
  </p>
}

PostItem.propTypes = {
  post: PT.object,
}
