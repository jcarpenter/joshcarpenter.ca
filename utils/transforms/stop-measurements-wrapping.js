const cheerio = require('cheerio')
const path = require('path')

// Find abreviations. E.g. 65 m, 500 A.D., 100 lbs.
// Demo: https://regex101.com/r/0BHVNR/1
const abbreviationsRE = /(\d)(\s)(mm|m|cm|BC|AD|kW|Wh|W|A|V|lbs|ft)(?![\d\w])/g

/**
 * Prevent line breaks between values and units (e.g. 800 mm
 * being split onto two lines) by inserting non-breakings 
 * spaces between the two.
 * Before: '1200 lbs'
 * After:  '1200&nbsp;lbs'
 */
module.exports = function(content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  const $ = cheerio.load(content)

  // Find all instances of values and units and insert
  // non-breaking space between them
  $('article #body').children().each((index, el) => {
    const updated = $(el).html().replace(abbreviationsRE, `$1&nbsp;$3`)
    $(el).html(updated)
  })
    
  content = $.html()
  return content
}