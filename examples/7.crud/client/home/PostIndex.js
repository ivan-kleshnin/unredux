import PT from "prop-types"
import * as R from "ramda"
import React from "react"
import PostItem from "./PostItem"

export default function PostIndex({posts, index}) {
  return <div data-key="postIndex">
    <h1>Blog</h1>
    <details className="margin-bottom-sm">
      <summary>Fields</summary>
      <code>id</code> – sort & filter<br/>
      <code>title</code> – sort & filter<br/>
      <code>tags</code> – filter<br/>
      <code>isPublished</code> – filter
    </details>
    <div className="clearfix margin-bottom-sm">
      <div className="pull-left">
        <label>
          Id<br/>
          <input type="text" name="filter.id" value={index.filter.id} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Title<br/>
          <input type="text" name="filter.title" value={index.filter.title} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Tags <small className="gray text">separated by ","</small><br/>
          <input type="text" name="filter.tags" value={index.filter.tags} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          <br/>
          <input type="checkbox" name="filter.isPublished" checked={index.filter.isPublished}/>
          Published
        </label>
      </div>
    </div>
    <div className="clearfix">
      <div className="pull-left">
        Sort by:<br/>
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
    </div>
    <div className="margin-top">
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

