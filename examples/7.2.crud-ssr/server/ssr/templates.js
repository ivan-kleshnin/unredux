let appHead = ({state, url}) => {
  return `<head>
    <meta charset="utf-8"/>
    <title>7.2 CRUD-SSR</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"/>
    <link rel="stylesheet" href="/bundle.css"/>
  </head>`
}

export let appLayout = ({appKey, appHTML, state, url}) => {
  return `<!DOCTYPE html><html lang="en">
    ${appHead({state, url})}
    <body>
      <div id="${appKey}">${appHTML}</div>
      <script id="${appKey}-state">
        window["${appKey}"].state = ${JSON.stringify(state, null, 2)}
      </script>
      <script src="/bundle.js"></script>
    </body>
  </html>`
}
