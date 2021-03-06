function googleSheetsRestApi (config) {
  function add (data, options) {
    return post({
      operation: 'add',
      sheetName: options.sheetName,
      accessToken: config.accessToken,
      mode: typeof options.mode === 'undefined' ? 'append' : options.mode,
      data
    })
  }

  function read (options) {
    return post({
      operation: 'read',
      sheetName: options.sheetName
    })
  }

  async function post (body) {
    const result = await window.fetch(
      `https://script.google.com/macros/s/${config.deploymentId}/exec`,
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

  return {
    add,
    read
  }
}

window.googleSheetsRestApi = googleSheetsRestApi
