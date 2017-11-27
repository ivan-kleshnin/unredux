import PT from "prop-types"
import * as R from "ramda"
import React from "react"
import PostItem from "./PostItem"

export default function PostIndex({posts, index}) {
  return <div data-key="postIndex">
    <h1>Blog</h1>
    <div style={{marginBottom: "10px"}}>
      Filter by:
      {" "}
      <label>
        <input type="checkbox" name="filter.new" checked={index.filter.new} onChange={R.id}/> New
      </label>
      {" "}
      <label>
        <input type="checkbox" name="filter.hit" checked={index.filter.hit} onChange={R.id}/> Hit
      </label>
      {" "}
      <label>
        <input type="text" name="filter.title" value={index.filter.title} onChange={R.id}/> Title
      </label>
    </div>
    <div style={{marginBottom: "10px"}}>
      Sort by:
      {" "}
      <button name="sort" value="+id">
        {index.sort == "+id" ? <b>+id</b> : "+id"}
      </button>
      {" "}
      <button name="sort" value="+title">
        {index.sort == "+title" ? <b>+title</b> : "+title"}
      </button>
      {" "}
      <button name="sort" value="-id">
        {index.sort == "-id" ? <b>-id</b> : "-id"}
      </button>
      {" "}
      <button name="sort" value="-title">
        {index.sort == "-title" ? <b>-title</b> : "-title"}
      </button>
    </div>
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

