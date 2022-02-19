const cheerio = require('cheerio')

/**
 * Add unique IDs to figures and figcaption:
 */
module.exports = function (content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  const $ = cheerio.load(content)
  const figures = $('article #body figure')

  figures.each((index, f) => {

    // const media = $(f).find(`
    //   > picture img,
    //   > img, 
    //   > video source
    // `)
    
    // if (media.length) {
    //   // Get src, minus extension and size suffix (numbers at end).
    //   // img/chromevr-800.png --> chromevr
    //   // img/sealevel-1920-1950-800.png --> sealevel-1920-1950
    //   let id = path.parse(media.attr('src')).name.replace(/-\d+$/, '')
    //   figures.attr('id', id)
    // }

    // Assign numeric id to figure
    $(f).attr('id', `fig${index}`)
    
    // Assign same number id to figcaption
    const caption = $(f).find('figcaption')
    if (caption.length) caption.attr('id', `fig${index}-cap`)
  })

  content = $.html()
  return content
}
