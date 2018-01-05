export let layout200 = ({appHTML, state}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <title>7. CRUD</title>
        <link rel="icon" type="image/gif" href="/public/favicon.gif"/>
        <link rel="stylesheet" href="/public/bundle.css"/>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"/>
      </head>
      <body>
        <div id="root">${appHTML}</div>
        <script id="rootState">
          window.state = ${JSON.stringify(state, null, 2)}
        </script>
        <script src="/public/bundle.js"></script>
      </body>
    </html>`
}

export let layout404 = () => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <link rel="icon" type="image/gif" href="/public/favicon.gif"/>
      </head>
      <body>
        <h1>Not Found</h1>
        <div>Page not found</div>
      </body>
    </html>`
}

export let layout500 = (err) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <link rel="icon" type="image/gif" href="/public/favicon.gif"/>
      </head>
      <body>
        <h1>Server Error</h1>
        <div>${err.message}</div>
      </body>
    </html>`
}
