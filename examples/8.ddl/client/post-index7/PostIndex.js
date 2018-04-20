import PT from "prop-types"
import React from "react"
import PostItem from "./PostItem"
import UserItem from "./UserItem"
import Loading from "../common/Loading"

export default function PostIndex({index, loading, posts, users}) {
  return <div data-key="postIndex">
    <h1>Blog</h1>
    <div>
      {R.isEmpty(posts)
        ? <Loading flag={loading[`7/posts`]}></Loading>
        : posts.map(post =>
            <PostItem key={post.id} post={post}/>
          )
      }
    </div>
    <button data-key="loadNext" disabled={loading[`7/posts`] || index.ids.length >= index.total}>
      Load next {loading[`7/posts`] ? "[...]" : ""}
    </button>
    <h3>Users</h3>
    <div>
      {R.isEmpty(users)
        ? <Loading flag={loading[`7/posts`] || loading[`7/users`]}></Loading>
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
