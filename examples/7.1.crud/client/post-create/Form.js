import PT from "prop-types"
import React from "react"

export default function Form({form}) {
  let {input = {}, errors = {}} = form
  return <form>
    <h1>Create Post</h1>
    <div>
      <div style={{color: "red"}}>{errors.title}</div>
      <label>
        Title<br/>
        <input type="text" name="title" value={input.title} onChange={R.id}/>
      </label>
    </div>
    <div>
      <div style={{color: "red"}}>{errors.text}</div>
      <label>
        Text<br/>
        <textarea name="text" value={input.text} onChange={R.id}/>
      </label>
    </div>
    <div>
      <div style={{color: "red"}}>{errors.tags}</div>
      <label>
        Tags <small className="gray text">separated by ","</small><br/>
        <input type="text" name="tags" value={input.tags} onChange={R.id}/>
      </label>
    </div>
    <div>
      <div style={{color: "red"}}>{errors.isPublished}</div>
      <label>
        Is Published<br/>
        <input type="checkbox" name="isPublished" checked={input.isPublished} onChange={R.id}/>
      </label>
    </div>
    <div>
      <div style={{color: "red"}}>{errors.publishDate}</div>
      <label>
        Date of Publication<br/>
        <input type="date" name="publishDate" value={input.publishDate} onChange={R.id}/>
      </label>
    </div>
    <button type="submit">Submit</button>
  </form>
}

Form.propTypes = {
  form: PT.object.isRequired,
}
