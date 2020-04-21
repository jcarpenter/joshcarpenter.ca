const cheerio = require('cheerio')

/**
 * If figures contain media, prep them for lightbox by assigning a unique ID and the lightbox attribute.
 */
module.exports = (content) => {

  const $ = cheerio.load(content)
  const figures = $('main figure')

  figures.each(function () {

    const fig = $(this)
    const img = fig.find('img')
    const video = fig.find('video')
    
    let mediaSrc

    // Get filename from the media
    if (img) {
      mediaSrc = img.attr('src')
    } else if (video) {
      mediaSrc = video.attr('src')
    } else {

      // If no media exists, return. 
      // We only want to assign lightbox to figures with media.
      return
    }

    if (mediaSrc) {

      // E.g. fukushima
      let mediaName = mediaSrc.substring(mediaSrc.lastIndexOf("/") + 1, mediaSrc.lastIndexOf("."))
      // Add '-fig' suffix. E.g. fukushima-fig
      figId = `${mediaName}-fig`
      // Assign id
      fig.attr('id', figId)
      // Assign lightbox attribute
      fig.attr('data-lightbox', 'true')
    }
  })

  content = $.html()
  return content
}
