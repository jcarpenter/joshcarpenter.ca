const cheerio = require('cheerio')
const colors = require('colors')
const config = require('../config')
const fse = require('fs-extra')
const globby = require('globby')
const sharp = require('sharp')

/**
 * Find an image file by name.
 * @param {*} img - Full or partial image path. E.g. `josh.png`.
 * @returns {string} - Path of image file. E.g. `_site/img/josh-lg.jpg`
 */
function getImage(img) {

  let path

  // Trim to just filename. In most cases this shouldn't be needed.
  // Before: `../img/josh.jpg`. After: `josh`
  let imgName = img.substring(img.lastIndexOf('/') + 1, img.lastIndexOf('.'))

  const imgDirectoryContents = globby.sync('_site/img/*.{jpg,png}')

  for (const file of imgDirectoryContents) {
    if (file.includes(imgName)) {
      path = file
    }
  }

  return path ? path : console.error(`Could not find image file with ${img} in name`.bgRed)
}

/**
 * Find an image file by name. Specifically, the largest available version of the image.
 * @param {*} img - Full or partial image path. E.g. `/img/josh.png`
 * @returns {string} - Path of image file. E.g. `_site/img/josh-lg.jpg`
 */
function getLargestVersionOfImage(img) {

  const imgDirectoryContents = globby.sync('_site/img/*.{jpg,png}')
  const sizes = config.responsive_images.sizes

  let path

  // Trim to just filename. In most cases this shouldn't be needed.
  // Before: `../img/josh.jpg`. After: `josh`
  let imgName = img.substring(img.lastIndexOf('/') + 1, img.lastIndexOf('.'))

  // E.g. `-lg`, `-md`
  let largestSuffix = sizes[sizes.length - 1].suffix
  let secondLargestSuffix = sizes[sizes.length - 2].suffix
  let thirdLargestSuffix = sizes[sizes.length - 3].suffix

  // Find the largest version of the default image in the build images directory.
  // Try largest first, then next largest, then next after that...
  for (const file of imgDirectoryContents) {
    if (file.includes(`${imgName}${largestSuffix}`)) {
      path = file
      break
    } else if (file.includes(`${imgName}${secondLargestSuffix}`)) {
      path = file
      break
    } else if (file.includes(`${imgName}${thirdLargestSuffix}`)) {
      path = file
      break
    }
  }

  return path ? path : console.error(`Could not find image file with ${img} in name`.bgRed)
}

/**
 * Set a working image path for image meta tags, and matching dimensions.
 */
module.exports = async (content) => {

  const $ = cheerio.load(content)
  const tag = $('meta[property="og:image"]')
  const src = tag.attr('content')
  const defaultImg = config.meta.default_image.url
  let newSrc = ''

  // If there's no source, return. Else, continue.
  if (!src) {
    return
  }

  if (src == 'getFirstImage') {

    // Find first image
    const firstImage = $('figure img').first()

    // If an image exists, use it's `src`
    // Else, use default image
    if (firstImage) {
      newSrc = getImage(firstImage.attr('src'))
    } else {
      newSrc = getLargestVersionOfImage(defaultImg)
    }

  } else if (src == 'getDefaultImage' || src == '') {

    newSrc = getLargestVersionOfImage(defaultImg)

  } else if (src !== '') {

    // If value != `getFirstImage`, `getDefaultImage`, or empty (''),  we assume an image asset has been manually specified, and get the corresponding image file from the build images directory.
    newSrc = getLargestVersionOfImage(src)
  }

  // Get width and height from image metadata
  const { width, height } = await sharp(newSrc).metadata()

  // console.log("-------")
  // console.log($('title').text())
  // console.log(newSrc)
  // console.log(width, height)

  // Remove build directory from image path, and replace with full site URL.
  // It seems FB and Twitter expect full paths.
  // Before: _site/img/jc-lg.jpg
  // After: https://joshcarpenter.ca/img/jc-lg.jpg
  newSrc = newSrc.replace('_site', config.meta.url)

  // Set new tag value, and add dimension tags.
  tag.attr('content', newSrc)
  tag.after(`<meta property="og:image:height" content="${height}">`)
  tag.after(`<meta property="og:image:width" content="${width}">`)
  
  content = $.html()
  return content
}