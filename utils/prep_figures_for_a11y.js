const cheerio = require('cheerio')

/**
 * Add aria-labelledby and role to figures, pointing to figcaption.
 * If figure contains img, and img has `title` text, swap `title` to `alt``.
 * We have to do this because of limits in pandoc-flavored Markdown:
 * - Figures are defined as follows: ![Caption text](image-path.jpg "Title text").
 * - It does not let us define image alt text. So instead we use the title text.
 */
module.exports = (content) => {

  const $ = cheerio.load(content)
  const figures = $('#post-body figure')
  let index = 0

  figures.each(function () {

    const fig = $(this)
    const figId = fig.attr('id') // E.g. fukushima-fig
    const figcap = fig.find('figcaption')

    if (figcap) {

      // Generate ID. Use figId as base, if it exists. Else make new unique id.
      // E.g. fukushima-figcap [or] fig4-figcap. 
      const figcapId = figId ? `${figId}cap` : `fig${index}-figcap`

      // Set ID
      figcap.attr('id', figcapId)

      // Add aria-labelledby
      fig.attr('aria-labelledby', figcapId)
    }

    const img = fig.find('img')

    if (img) {
      const title = img.attr('title')
      
      // Set alt text to title text (if it exists), or make it empty.
      // Then remove title attribute. See module summary comment for why.
      if (title) {
        img.attr('alt', title)
      } else {
        img.attr('alt', null)
      }
      
      img.attr('title', null)
    }

    // Add role="figure", for backwards compatibility sake.
    fig.attr('role', 'figure')

    index++

  })

  content = $.html()
  return content
}
