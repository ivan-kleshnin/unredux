let head = () => `
  <head>
    <meta charSet="utf-8"/>
    <title>7. CRUD</title>
    <link rel="icon" type="image/gif" href="/public/favicon.gif"/>
    <link rel="stylesheet" href="/public/bundle.css"/>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"/>
  </head>`

export let layout200 = ({appKey, appHTML, state}) => `
  <!DOCTYPE html>
  <html lang="en">
    ${head()}
    <body>
      <div id="${appKey}">${appHTML}</div>
      <script id="rootState">
        window.state = ${JSON.stringify(state, null, 2)}
      </script>
      <script src="/public/bundle.js"></script>
    </body>
  </html>`

export let layout404 = () => `
  <!DOCTYPE html>
  <html lang="en">
    ${head()}
    <body>
      <h1>Not Found</h1>
      <div>Page not found</div>
    </body>
  </html>`

export let layout500 = (err) => `
  <!DOCTYPE html>
  <html lang="en">
    ${head()}
    <body>
      <h1>Server Error</h1>
      <div>${err.message}</div>
    </body>
  </html>`
