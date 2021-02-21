/* global ContentService, LockService, SpreadsheetApp */

const ACCESS_TOKENS = [
  'foo'
]

function read (sheet) {
  const headers = getHeaders(sheet)
  const result = []
  const range = sheet.getRange(
    2,
    1,
    sheet.getLastRow() - 1,
    sheet.getLastColumn()
  )
  const rows = range.getValues()
  for (const row of rows) {
    const rowData = {}
    let index = 0
    for (const header of headers) {
      rowData[header] = row[index] === '' ? null : row[index]
      index += 1
    }
    result.push(rowData)
  }
  return result
}

function write (sheet, options) {
  if (typeof options.accessToken === 'undefined') {
    throw new Error('Need an `accessToken`')
  }
  if (ACCESS_TOKENS.indexOf(options.accessToken) === -1) {
    throw new Error(`Invalid access token: ${options.accessToken}`)
  }
  const lock = LockService.getScriptLock()
  lock.waitLock(3000)
  const newRowIndex = options.mode === 'append' ? sheet.getLastRow() + 1 : 2
  sheet.insertRows(newRowIndex, options.data.length)
  const headers = getHeaders(sheet)
  const newRowsData = []
  for (const row of options.data) {
    const newRowData = []
    for (const header of headers) {
      newRowData.push(typeof row[header] === 'undefined' ? '' : row[header])
    }
    newRowsData.push(newRowData)
  }
  const range = sheet.getRange(newRowIndex, 1, newRowsData.length, headers.length)
  range.setValues(newRowsData)
  lock.releaseLock()
  return null
}

function getHeaders (sheet) {
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn())
  const rows = range.getValues()
  return rows[0]
}

// eslint-disable-next-line no-unused-vars
function doPost (event) {
  try {
    const { operation, sheetName, ...options } = JSON.parse(
      event.postData.contents
    )
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      sheetName
    )
    const operations = {
      read,
      write
    }
    if (typeof operations[operation] === 'undefined') {
      throw new Error(`Invalid operation: ${operation}`)
    }
    const result = operations[operation](sheet, options)
    return ContentService.createTextOutput(
      JSON.stringify({ error: null, result })
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.message, result: null })
    ).setMimeType(ContentService.MimeType.JSON)
  }
}
