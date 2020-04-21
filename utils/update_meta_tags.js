const cheerio = require('cheerio')
const config = require('../config')
const globby = require('globby')

/**
 * Return the largest available version of a given image.
 * @param {*} img - Filename. E.g. `josh.png`
 */
function getLargestVersionOfImage(img) {

  const imgDirectoryContents = globby.sync('_site/img/*.{jpg,png}')
  const sizes = config.responsive_images.sizes

  let src = ''

  // Before: `josh.jpg`. After: `josh`
  let imgName = img.substring(0, img.lastIndexOf('.'))

  // E.g. `-lg`, `-md`
  let largestSuffix = sizes[sizes.length - 1].suffix
  let secondLargestSuffix = sizes[sizes.length - 2].suffix
  let thirdLargestSuffix = sizes[sizes.length - 3].suffix

  // Find the largest version of the default image in the build images directory.
  for (const path of imgDirectoryContents) {
    if (path.includes(`${imgName}${largestSuffix}`)) {
      src = path
      break
    } else if (path.includes(`${imgName}${secondLargestSuffix}`)) {
      src = path
      break
    } else if (path.includes(`${imgName}${thirdLargestSuffix}`)) {
      src = path
      break
    }
  }

  // Trim '_site' off the path:
  // Before: '_site/img/jc-lg.jpg'
  // After: '/img/jc-lg.jpg'
  src = src.replace('_site', '')
  return src
}

module.exports = (content, imgDirectoryContents) => {

  const $ = cheerio.load(content)
  const tag = $('meta[property="og:image"]')
  const src = tag.attr('content')
  const defaultImg = config.meta.default_image.url
  let newSrc = ''

  // console.log("- - - - - - -")
  // console.log($('title').text())

  if (src) {

    if (src == 'getFirstImage') {

      // Find first image
      const firstImage = $('figure img').first()

      // If an image exists, use it's `src`
      // Else, use default image
      if (firstImage) {
        newSrc = firstImage.attr('src')
      } else {
        newSrc = getLargestVersionOfImage(defaultImg)
      }

    } else if (src == 'getDefaultImage' || src == '') {

      newSrc = getLargestVersionOfImage(defaultImg)

    } else if (src !== '') {

      // If value != `getFirstImage`, `getDefaultImage`, or empty (''),  we assume an image asset has been manually specified, and get the corresponding image file from the build images directory.
      // First we trim to just filename. In most cases this shouldn't be needed. But it helps prevent human error.
      const manuallySpecifiedImg = src.substring(src.lastIndexOf('/') + 1)
      newSrc = getLargestVersionOfImage(manuallySpecifiedImg)
    }
  }

  // Set new tag value
  // console.log(src)
  // console.log(newSrc)
  tag.attr('content', newSrc)
  content = $.html()
  return content
}