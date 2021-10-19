const cheerio = require('cheerio')

/**
 * Add unique IDs to figure and figcaption:
 */
module.exports = function (content, outputPath) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!outputPath) return content

  const $ = cheerio.load(content)
  const figures = $('#post #content figure')

  figures.each((index, f) => {
    const caption = $(f).find('figcaption')
    $(f).attr('id', `fig${index}`)
    if (caption) caption.attr('id', `fig${index}-cap`)
  })

  return content
}
