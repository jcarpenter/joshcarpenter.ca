const cheerio = require('cheerio')
const path = require('path')

// Find abreviations. E.g. 65 m, 500 A.D., 100 lbs.
// Demo: https://regex101.com/r/0BHVNR/1
const abbreviationsRE = /(\d)(\s)(mm|m|cm|BC|AD|kW|Wh|W|A|V|lbs|ft)(?![\d\w])/g

/**
 * Append lightbox.js script if the page contains 
 * any figures with media (e.g. video, picture).
 */
module.exports = function(content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  const $ = cheerio.load(content)
  $('#post #content').children().each((index, el) => {
    const updated = $(el).html().replace(abbreviationsRE, `$1&nbsp;$3`)
    $(el).html(updated)
  })
  
  // const text = $.text()
  // text.replaceAll(abbreviationsRE, '&nbsp;')
  
  content = $.html()
  return content
}