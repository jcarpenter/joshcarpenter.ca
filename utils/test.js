const cheerio = require('cheerio')

/**
 * If there are any footnotes, create footnotes section.
 * If any of the footnotes contain `class="citation"`, create references section.
 */
module.exports = (content) => {

  const $ = cheerio.load(content)
  content = $.html()
  return content
}