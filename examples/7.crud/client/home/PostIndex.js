import PT from "prop-types"
import * as R from "ramda"
import React from "react"
import PostItem from "./PostItem"

export default function PostIndex({posts, index}) {
  return <div data-key="postIndex">
    <h1>Blog</h1>
    <p>
      <a href="/posts/create">New Post</a>
    </p>
    <div style={{marginBottom: "10px"}}>
      Used Fields: <code>id</code> (sort + filters){" "}
        <code>title</code> (sort + filters){" "}
        <code>tags</code> (filters){" "}
        <code>isPublished</code> (filters){" "}
        <code>publishDate</code> (sort + filters)
    </div>
    <div style={{marginBottom: "10px"}}>
      Filter by:{" "}
      <label>
        Id{" "}
        <input type="text" name="filters.id" value={index.filters.id} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Title{" "}
        <input type="text" name="filters.title" value={index.filters.title} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Tags <small>separated by ,</small>{" "}
        <input type="text" name="filters.tags" value={index.filters.tags} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Published{" "}
        <input type="checkbox" name="filters.isPublished" checked={index.filters.isPublished}/>
      </label>
      {" "}
      <label>
        Publish Date From{" "}
        <input type="date" name="filters.publishDateFrom" value={index.filters.publishDateFrom} onChange={R.id}/>
      </label>
      {" "}
      <label>
        Publish Date To{" "}
        <input type="date" name="filters.publishDateTo" value={index.filters.publishDateTo} onChange={R.id}/>
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

