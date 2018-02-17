import * as R from "@paqmind/ramda"
import PT from "prop-types"
import React from "react"
import Loading from "../common/Loading"

export default function PostForm({loading, form}) {
  let {input = {}, errors = {}} = form
  return <form>
    <h1>Edit Post</h1>
    {loading
      ? <Loading/>
      : <div>
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

        <div>
          <div>{errors.tags}</div>
          <label>
            Tags <small className="gray text">separated by ","</small><br/>
            <input type="input" name="tags" value={input.tags} onChange={R.id}/>
          </label>
        </div>

        <div>
          <div>{errors.isPublished}</div>
          <label>
            Is Published<br/>
            <input type="checkbox" name="isPublished" checked={input.isPublished} onChange={R.id}/>
          </label>
        </div>

        <button type="submit">Submit</button>
      </div>}
  </form>
}

PostForm.propTypes = {
  loading: PT.bool.isRequired,
  form: PT.object,
}
