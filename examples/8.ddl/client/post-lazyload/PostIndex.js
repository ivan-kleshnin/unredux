import * as R from "@paqmind/ramda"
import PT from "prop-types"
import React from "react"
import PostItem from "./PostItem"

export default function PostIndex({index, posts}) {
  return <div data-key="postIndex">
    <h1 className="title">Blog</h1>
    <div className="margin-top">
    {posts.map(post =>
      <PostItem key={post.id} post={post}/>
    )}
    </div>
    <button data-key="loadNext">Load next</button>
  </div>
}

PostIndex.propTypes = {
  // index: PT.object.isRequired,
  // posts: PT.arrayOf(PostItem.propTypes.post).isRequired,
}

