import PT from "prop-types"
import React from "react"

export default function PostItem({post}) {
  return <pre>
    <a href={`/posts/${post.id}/`}><i className="fa fa-eye"></i></a>{" "}
    {JSON.stringify(post)}
  </pre>
}

PostItem.propTypes = {
  post: PT.object,
}
