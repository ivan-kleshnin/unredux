import PT from "prop-types"
import React from "react"
import Loading from "common/Loading"
import PostItem from "./PostItem"
import UserItem from "./UserItem"

export default function PostIndex({subset, index, loading, posts, users}) {
  return <div data-key="postIndex">
    <h1>Blog</h1>
    <div>
      {R.isEmpty(posts)
        ? <Loading flag={loading[`${subset}/posts`]}></Loading>
        : posts.map(post =>
            <PostItem key={post.id} post={post}/>
          )
      }
    </div>
    <button data-key="loadNext" disabled={loading[`${subset}/posts`] || index.ids.length >= index.total}>
      Load next {loading[`${subset}/posts`] ? "[...]" : ""}
    </button>
    <h3>Users</h3>
    <div>
      {R.isEmpty(users)
        ? <Loading flag={loading[`${subset}/posts`] || loading[`${subset}/users`]}></Loading>
        : R.values(users).map(user =>
            <UserItem key={user.id} user={user}/>
          )
      }
    </div>
  </div>
}

PostIndex.propTypes = {
  loading: PT.object.isRequired,
  index: PT.object.isRequired,
  posts: PT.arrayOf(PostItem.propTypes.post).isRequired,
  users: PT.objectOf(UserItem.propTypes.user).isRequired,
}
