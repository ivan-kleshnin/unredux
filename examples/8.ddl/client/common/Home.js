import React from "react"

export default function Home() {
  return <div>
    <p>Details</p>
    <ol>
      <li><a href="/0a/posts/1/">Post (userId=1) + User (id=1)</a></li>
      <li><a href="/0a/posts/2/">Post (userId=2) + No User</a></li>
      <li><a href="/0a/posts/3/">No Post</a></li>
      <li><a href="/0a/posts/4/">Post (userId=null)</a></li>
      <li><a href="/0b/posts/4/">Post (userId=null), userId is optional</a></li>
      <li><a href="/0a/posts/5/">Post (no userId)</a></li>
      <li><a href="/0b/posts/5/">Post (no userId), userId is optional</a></li>
    </ol>

    <p>Indexes, Basic</p>
    <ol>
      <li><a href="/1a/posts/">Posts + Users</a></li>
      <li><a href="/2a/posts/">Posts + Some Users</a></li>
      <li><a href="/3a/posts/">Some Posts</a></li>
      <li><a href="/4a/posts/">Posts (userId=null)</a></li>
      <li><a href="/4b/posts/">Posts (userId=null), userId is optional</a></li>
      <li><a href="/5a/posts/">Posts (no userId)</a></li>
      <li><a href="/5b/posts/">Posts (no userId), userId is optional</a></li>
      <li><a href="/6a/posts/">No Posts</a></li>
    </ol>

    <p>Indexes, Special</p>
    <ol>
      <li><a href="/7/posts/">Posts of Active Users</a></li>
    </ol>
  </div>
}
