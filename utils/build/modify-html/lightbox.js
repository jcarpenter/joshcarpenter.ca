const cheerio = require('cheerio')

/**
 * Append lightbox.js script if there are elements that meet the criteria
 * E.g. If there are any figures containing images.
 * While we're at it, set data-lightbox attribute on matching elements.
 * We use this in `lightbox.js` as our flag for what to include.
 */
module.exports = (content) => {

  const $ = cheerio.load(content)

  // Get figures. If there aren't any, exit.
  const figures = $('main figure')
  if (!figures.length) {
    return content
  }

  // Start a lightbox items array. We'll add to it every time we find a
  // <figure> that matches the criteria (contains supported media). If 
  // it !== 0 at the end, we'll add the lightbox.js <script>.
  let lightboxItems = []

  // For each...
  figures.each(function (index) {

    const figure = $(this)

    // Find media. Look for img first, then look for video
    let media
    const img = figure.find('img')
    const video = figure.find('video')
    if (img.length) {
      media = img
      figure.attr('data-lightbox', 'image')
    } else if (video.length) {
      media = video
      figure.attr('data-lightbox', 'video')
    } else {
      // If no media exists, return. 
      // We only want to assign lightbox to figures that contain supported media.
      return
    }

    media.addClass('thumb')

    // Add to lightbox_items list
    lightboxItems.push(figure)
  })

  // Add popup-footnotes.js <script>
  if (lightboxItems.length > 0) {
    const head = $('head')
    const lightbox_js = '<script src="/js/lightbox.js"></script>'
    head.append(lightbox_js)
  }

  // Return
  content = $.html()
  return content
}
