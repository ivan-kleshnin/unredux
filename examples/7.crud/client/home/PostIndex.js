import PT from "prop-types"
import * as R from "ramda"
import React from "react"
import PostItem from "./PostItem"

export default function PostIndex({posts, index}) {
  return <div data-key="postIndex">
    <h1>Blog</h1>
    <div style={{marginBottom: "10px"}}>
      Fields: <code>id</code> (sort){" "}
              <code>title</code> (sort + filter){" "}
              <code>tags</code> (filter){" "}
              <code>isPublished</code> (filter)
    </div>
    <div style={{marginBottom: "10px"}}>
      Filter by:{" "}
      <label>
        Title{" "}
        <input type="text" name="filter.title" value={index.filter.title} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Tags <small>separated by ,</small>{" "}
        <input type="text" name="filter.tags" value={index.filter.tags} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Published{" "}
        <input type="checkbox" name="filter.isPublished" checked={index.filter.isPublished}/>
      </label>
      {" "}
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

