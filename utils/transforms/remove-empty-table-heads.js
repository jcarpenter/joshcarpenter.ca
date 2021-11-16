const cheerio = require('cheerio')
const path = require('path')

// const path = require('path')

/**
 * Append lightbox.js script if the page contains 
 * any figures with media (e.g. video, picture).
 */
module.exports = function(content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  const $ = cheerio.load(content)
  const tableHeads = $('#post #content table thead')

  tableHeads.each((index, thead) => { 
    const text = $(thead).text()
    const trimmed = text.replaceAll(/[\n\s]/g, '')
    if (!trimmed.length) $(thead).remove()
  })
  
  content = $.html()
  return content
}