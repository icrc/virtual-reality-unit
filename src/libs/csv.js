/**
 * Downloads a csv.
 *
 * @param      {Array}       data                       The data
 * @param      {Array|null}  [headers=null]             The headers
 * @param      {string}      [filename="download.csv"]  The filename
 * @return     {undefined}        returns undefined
 */
export function downloadCSV(data, headers = null, filename = "download.csv") {
  let csvContent = ""
  
  function formatCSVField(field) {
    const stringValue = typeof field === 'string' ? field : String(field)
    
    if (stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    } else if (stringValue.includes(',')) {
      return `"${stringValue}"`
    } else {
      return stringValue
    }
  }
  
  if (headers && headers.length) csvContent += headers.map(formatCSVField).join(',') + '\n'
  
  csvContent += data.map(row => {
    if (Array.isArray(row)) {
      return row.map(formatCSVField).join(',')
    } else {
      return formatCSVField(row)
    }
  }).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.href = url
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
