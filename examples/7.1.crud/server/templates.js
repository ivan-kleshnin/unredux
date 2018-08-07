let appHead = () => `
  <head>
    <meta charset="utf-8"/>
    <title>7.1 CRUD</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"/>
    <link rel="stylesheet" href="/bundle.css"/>
  </head>`

export let appLayout = ({appKey, appHTML}) => `
  <!DOCTYPE html>
  <html lang="en">
    ${appHead()}
    <body>
      <div id="${appKey}">${appHTML}</div>
      <script src="/bundle.js"></script>
    </body>
  </html>`
