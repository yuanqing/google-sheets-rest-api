;(function (window) {
  function googleSheetsRestApi (config) {
    function read (options) {
      return post({
        operation: 'read',
        sheetName: options.sheetName
      })
    }

    function add (data, options) {
      return post({
        operation: 'add',
        sheetName: options.sheetName,
        accessToken: config.accessToken,
        mode: typeof options.mode === 'undefined' ? 'append' : options.mode,
        data
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

  if (typeof module === 'object') {
    module.exports = googleSheetsRestApi
  } else {
    window.googleSheetsRestApi = googleSheetsRestApi
  }
})(this)
