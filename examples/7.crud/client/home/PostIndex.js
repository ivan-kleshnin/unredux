import PT from "prop-types"
import * as R from "ramda"
import React from "react"
import PostItem from "./PostItem"

export default function PostIndex({posts, index}) {
  return <div data-key="postIndex">
    <h1>Blog</h1>
    <div style={{marginBottom: "10px"}}>
      Fields: <code>id</code> (sort + filter){" "}
              <code>title</code> (sort + filter){" "}
              <code>tags</code> (filter){" "}
              <code>isPublished</code> (filter)
    </div>
    <div style={{marginBottom: "10px"}}>
      Filter by:{" "}
      <label>
        Id{" "}
        <input type="text" name="filter.id" value={index.filter.id} onChange={R.id}/>
      </label>
      {" "}
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
      <button name="sort" value={index.sort == "+id" ? "-id" : "+id"}>
        {index.sort == "+id" ? <span><b>&uarr; id</b></span> :
         index.sort == "-id" ? <span><b>&darr; id</b></span> :
                               <span>&uarr; id</span>
        }
      </button>
      {" "}
      <button name="sort" value={index.sort == "+title" ? "-title" : "+title"}>
        {index.sort == "+title" ? <span><b>&uarr; title</b></span> :
         index.sort == "-title" ? <span><b>&darr; title</b></span> :
                                  <span>&uarr; title</span>
        }
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

