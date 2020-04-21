const cheerio = require('cheerio')
const config = require('../config')
const globby = require('globby')

/**
* Add responsive attributes to jpg and pngs (only), and set `src` to largest available size.
* Update all `src` paths to be absolute, and point to flat img/ structure.
*/
module.exports = (content) => {

  const $ = cheerio.load(content)
  const images = $('img')
  const imgDirectoryContents = globby.sync('_site/img/*.{jpg,png}')

  images.each(function () {

    // Before: `../img/post/hello.jpg`
    // After: `/img/hello.jpg`
    let img = $(this)
    let src = img.attr('src')
    let ext = src.slice(src.length - 3)
    let name = src.substring(src.lastIndexOf("/") + 1).slice(0, -4)

    // Add responsive attributes to jpg and pngs only
    if (ext == 'jpg' || ext == 'png') {

      let srcset = ''
      let matches = 0
      let newSrc

      // For the current image, find paths in img/ directory with matching names
      // Push each match into srcset
      config.responsive_images.sizes.forEach((size) => {
        imgDirectoryContents.forEach((path) => {
          if (path.includes(`${name}${size.suffix}`)) {
            matches++
            // E.g. `/img/oceans-lg.jpg 1440w`
            let item = `/img/${name}${size.suffix}.jpg ${size.descriptor}`
            // If there are multiple matches, start adding commas before each one.
            if (matches > 1) {
              item = ', ' + item
            }

            // newSrc always equals largest available size
            newSrc = `/img/${name}${size.suffix}.jpg`

            srcset += item
          }
        })
      })

      // Only add responsive attributes if there are multiple image sizes
      if (matches > 1) {
        img.attr('srcset', srcset)
        img.attr('sizes', config.sizes_attribute)
      }

      img.attr('src', newSrc)

    } else {
      const newSrc = '/img/' + src.substring(src.lastIndexOf("/") + 1)
      img.attr('src', newSrc)
    }
  })

  content = $.html()
  return content
}
