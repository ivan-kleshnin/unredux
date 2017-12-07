import React from "react"

export default function Footer(props) {
  return <div>
    <p>
      Show:
      {" "}
      <a href="#all" data-key="filter" data-val="all">All</a>
      {", "}
      <a href="#active" data-key="filter" data-val="active">Active</a>
      {", "}
      <a href="#completed" data-key="filter" data-val="completed">Completed</a>
    </p>
  </div>
}

Footer.propTypes = {}
