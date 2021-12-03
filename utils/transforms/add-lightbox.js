const cheerio = require('cheerio')
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
  const figures = $(`
    #post #content figure > picture, 
    #post #content figure > video, 
    #post #content figure > img
  `)
  
  if (figures.length) {
    $('head').append('<script src="/js/lightbox.js"></script>')
  }

  content = $.html()
  return content
}