import PT from "prop-types"
import * as R from "ramda"
import React from "react"

export default function PostForm({input, errors}) {
  console.log("input:", input)
  console.log("errors:", errors)
  return <form>
    <h1>Create Post</h1>
    <div>
      <div>{errors.title}</div>
      <label>
        Title<br/>
        <input type="text" name="title" value={input.title} onChange={R.id}/>
      </label>
    </div>
    <div>
      <div>{errors.text}</div>
      <label>
        Text<br/>
        <textarea name="text" value={input.text} onChange={R.id}/>
      </label>
    </div>
    <button type="submit">Submit</button>
  </form>
}

PostForm.propTypes = {
  input: PT.object.isRequired,
  errors: PT.object.isRequired,
}

// {/*<div>
//       <div>{JSON.stringify(errors.tags)}</div>
//       <label>
//         Tags <small>split by ,</small><br/>
//         <input type="text" name="tags" value={form.tags} onChange={R.id}/>
//       </label>
//     </div>
//     <div>
//       <div>{JSON.stringify(errors.isPublished)}</div>
//       <label>
//         Is Published<br/>
//         <input type="checkbox" name="isPublished" value={form.isPublished} onChange={R.id}/>
//       </label>
//     </div>
//     <div>
//       {<div>{JSON.stringify(errors.publishDate)}</div>
//       <label>
//         Publish Date<br/>
//         <input type="date" name="publishDate" value={form.publishDate} onChange={R.id}/>
//       </label>
//     </div>*/}
