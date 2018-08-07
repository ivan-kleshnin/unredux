import PT from "prop-types"
import React from "react"
import Loading from "../common/Loading"
import NotFound from "../common/NotFound"
import PostItem from "./PostItem"
import"./index.less"
import x from "./logo.gif" // In order to Webpack move this file to `public` folder

// console.log("!!!", x) // TODO jac help pls.

export default function PostIndex({loading, index, posts}) {
  return <div data-key="postIndex">
    <h1 className="title">Blog <img src="/home/logo.gif"/></h1>
    <p>
      <a href="/posts/create/">New Post</a>
    </p>
    <details className="margin-bottom-sm">
      <summary>Fields</summary>
      <code>id: filters, sort</code><br/>
      <code>title: filters, sort</code><br/>
      <code>tags: filters</code><br/>
      <code>isPublished: filters</code><br/>
      <code>publishDate: filters, sort</code><br/>
    </details>
    <div className="clearfix margin-bottom-sm">
      <div className="pull-left">
        <label>
          Id<br/>
          <input type="text" name="filters.id" value={index.filters.id} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Title<br/>
          <input type="text" name="filters.title" value={index.filters.title} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Tags <small className="gray text">separated by ","</small><br/>
          <input type="text" name="filters.tags" value={index.filters.tags} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Is Published<br/>
          <input type="checkbox" name="filters.isPublished" checked={index.filters.isPublished} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Publish Date From<br/>
          <input type="date" name="filters.publishDateFrom" checked={index.filters.publishDateFrom} onChange={R.id}/>
        </label>
      </div>
      <div className="pull-left">
        <label>
          Publish Date To<br/>
          <input type="date" name="filters.publishDateTo" checked={index.filters.publishDateTo} onChange={R.id}/>
        </label>
      </div>
    </div>
    <div className="clearfix">
      <div className="pull-left">
        Sort by:<br/>
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
                                          <span>&uarr; Publish date</span>}
        </button>
      </div>
    </div>
    {posts
      ? <div className="margin-top">
          {posts.length
            ? posts.map(post =>
                <PostItem key={post.id} post={post}/>
              )
            : <p><i>No data.</i></p>}
        </div>
      : loading ? <Loading/> : <NotFound/>}
      {/* need something more generic than <NotFound/> here */}
  </div>
}

PostIndex.propTypes = {
  index: PT.object,
  posts: PT.arrayOf(PostItem.propTypes.post),
  loading: PT.bool.isRequired,
}
