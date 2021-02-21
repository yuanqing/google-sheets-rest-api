;(function (window) {
  function read (options) {
    return post(options.deploymentId, {
      operation: 'read',
      sheetName: options.sheetName
    })
  }

  function add (data, options) {
    return post(options.deploymentId, {
      operation: 'add',
      sheetName: options.sheetName,
      accessToken: options.accessToken,
      mode: typeof options.mode === 'undefined' ? 'append' : options.mode,
      data
    })
  }

  async function post (deploymentId, body) {
    const result = await window.fetch(
      `https://script.google.com/macros/s/${deploymentId}/exec`,
      {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8'
        }
      }
    )
    const json = await result.json()
    if (json.error !== null) {
      throw new Error(json.error)
    }
    return json.result
  }

  const sheets = {
    add,
    read
  }
  if (typeof module === 'object') {
    module.exports = sheets
  } else {
    window.sheets = sheets
  }
})(this)
