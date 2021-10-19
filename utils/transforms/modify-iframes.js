const cheerio = require('cheerio')

module.exports = function (content, outputPath) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!outputPath) return content

  const $ = cheerio.load(content)
  const iframes = $('#post #content iframe')

  iframes.each((index, i) => {

    $(i).wrap('<figure></figure>')

    const captionText = $(i).attr('data-caption')
    if (captionText) {
      $(i).after(`<figcaption>${captionText}</figcaption`)
    }

    // const caption = $(f).find('figcaption')

    // // Set unique id
    // $(f).attr('id', `fig${index}`)

    // // Set caption id
    // if (caption) {
    //   caption.attr('id', `fig${index}-cap`)
    // }

    // $(f).html(html)

  })

  content = $.html()
  return content
}