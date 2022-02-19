const colors = require('colors')
const cheerio = require('cheerio')
const path = require('path')

/**
 * Prep video elements by:
 * - Make autoplay videos lazy-loading, using this technique:
 *   https://web.dev/lazy-loading-video/#video-gif-replacement
 * - Check for missing poster images
 */
module.exports = function (content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  const $ = cheerio.load(content)
  const videos = $('main video')
  
  // If there are no videos, return
  if (!videos.length) return content
  
  // For each video...
  videos.each((index, video) => {

    const sources = $(video).find('source')

    // --------- Lazy load autoplay videos --------- //

    // If video has autoplay, make it lazy load by:
    // 1) Moving `src` to `data-src` attribute
    // 2) Adding lazy-load.js to head
    const isAutoplay = $(video).attr('autoplay') 
    if (isAutoplay) {

      // Add `lazy` class
      $(video).addClass('lazy')

      // Copy `src` value to `data-src`, then delete `src`
      sources.each((i, source) => {
        $(source).attr('data-src', $(source).attr('src'))
        $(source).removeAttr('src')
      })

      // Add video-lazy-load.js, if it doesn't already exist
      const scriptAlreadyExists = $('head script[src*=video-lazy-load]').length
      if (!scriptAlreadyExists) {
        $('head').append('<script src="/js/lazy-load.js"></script>')
      }
    }

    // // --------- Check for missing poster --------- //

    // // If video has `poster` attribute, optimize image and update path
    // // Else, throw warning.
    // const poster = $(video).attr('poster')

    // if (!poster) {
    //   // If poster attribute is missing, or string is empty,
    //   // throw warning.
    //   console.warn(`A video is missing a poster attribute in: ${this.outputPath}`.yellow, '- [make-videos.js]')
    // }
  })

  content = $.html()
  return content
}
