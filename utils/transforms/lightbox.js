const cheerio = require('cheerio')

/**
 * If the page contains data-lightbox thumbnails...
 * - Add lightbox-related attributes to thumbnails
 * - Append lightbox.js script
 */
module.exports = function(content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  const $ = cheerio.load(content)
  
  const thumbs = $(`article #body [data-lightbox]`)

  // If there are no data-lightbox elements, return without changes
  if (!thumbs.length) return content

  // Add other attributes to each data-lightbox thumbnail
  thumbs.each((index, thumb) => {
    $(thumb).attr('aria-label', 'Open in gallery')
    $(thumb).attr('aria-controls', 'lightbox')
    $(thumb).attr('tabindex', '0')
    $(thumb).attr('data-lightbox', index)
  })
  
  // Add lightbox JS
  $('head').append('<script src="/js/lightbox.js"></script>')

  content = $.html()
  return content
}