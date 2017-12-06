import PT from "prop-types"
import * as R from "ramda"
import React from "react"
import PostItem from "./PostItem"

export default function PostIndex({posts, index}) {
  return <div data-key="postIndex">
    <h1>Blog</h1>
    <div style={{marginBottom: "10px"}}>
      Used Fields: <code>id</code> (sort + filter){" "}
        <code>title</code> (sort + filter){" "}
        <code>tags</code> (filter){" "}
        <code>isPublished</code> (filter){" "}
        <code>publishDate</code> (sort + filter)
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
      <label>
        Publish Date From{" "}
        <input type="date" name="filter.publishDateFrom" value={index.filter.publishDateFrom} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Publish Date To{" "}
        <input type="date" name="filter.publishDateTo" value={index.filter.publishDateTo} onChange={R.id}/>
      </label>
    </div>
    <div style={{marginBottom: "10px"}}>
      Sort by:
      {" "}
      <button name="sort" value={index.sort == "+id" ? "-id" : "+id"}>
        {index.sort == "+id" ? <span><b>&uarr; Id</b></span> :
         index.sort == "-id" ? <span><b>&darr; Id</b></span> :
                               <span>&uarr; Id</span>
        }
      </button>
      {" "}
      <button name="sort" value={index.sort == "+title" ? "-title" : "+title"}>
        {index.sort == "+title" ? <span><b>&uarr; Title</b></span> :
         index.sort == "-title" ? <span><b>&darr; Title</b></span> :
                                  <span>&uarr; Title</span>
        }
      </button>
      {" "}
      <button name="sort" value={index.sort == "+publishDate" ? "-publishDate" : "+publishDate"}>
        {index.sort == "+publishDate" ? <span><b>&uarr; Publish Date</b></span> :
         index.sort == "-publishDate" ? <span><b>&darr; Publish Date</b></span> :
                                        <span>&uarr; Publish date</span>
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

