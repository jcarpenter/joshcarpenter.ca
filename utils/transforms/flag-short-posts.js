const cheerio = require('cheerio')

/**
 * Flag posts with `short-post` class, if they don't have
 * any h3 headers. We style these with a flatter typographic
 * visual hierarchy (h2 shrinks to size that h3 would be). 
 */
module.exports = function (content, outputPath) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!outputPath) return content

  const $ = cheerio.load(content)

  const h3 = $('#post #content h3')
  if (h3.length == 0) {
    $('#post #content').addClass('short-post') 
  }

  content = $.html()
  return content
}