import PT from "prop-types"
import React from "react"
import PostItem from "./PostItem"

export default function PostIndex({posts}) {
  return <div data-key="postIndex">
    <h1>Blog</h1>
    <div>
      {posts.length
        ? posts.map(post =>
          <PostItem key={post.id} post={post}/>
        )
        : <p><i>No posts available.</i></p>
      }
    </div>
  </div>
}

PostIndex.propTypes = {
  posts: PT.arrayOf(PostItem.propTypes.post).isRequired,
}

