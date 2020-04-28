const cheerio = require('cheerio')
const config = require('../config')
const globby = require('globby')
const sharp = require('sharp')

/**
* - Set responsive attributes, and set `src` to largest available size (jpg & png only)
* - Set `loading` attribute (jpg & png only)
* - Update paths to absolute and flat images directory `/img/`
*   - Before: `../img/post/hello.jpg`
*   - After: `/img/hello.jpg`
* - Set image width/height attributes.
*/

module.exports = async (content, path) => {

  const $ = cheerio.load(content)
  const images = $('img')
  const imgDirectoryContents = globby.sync('_site/img/*.{jpg,png}')
  const isTypeArticle = path.includes('post') || path.includes('design')

  images.each(function (index, element) {
    let img = $(this)
    let src = img.attr('src')
    let ext = src.slice(src.length - 3)
    let name = src.substring(src.lastIndexOf("/") + 1).slice(0, -4)
    let newSrc

    // Add responsive attributes to jpg and pngs only
    if (ext == 'jpg' || ext == 'png') {

      let srcset = ''
      let matches = 0

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

      // Set update src
      img.attr('src', newSrc)

      // Makes images in post or design articles load `lazy`.
      // Except first image. It should load `eager`.
      // Docs: https://web.dev/native-lazy-loading/
      if (isTypeArticle) {
        const loadingVal = index > 1 ? 'lazy' : 'eager'
        img.attr('loading', loadingVal)
      }
    } else {

      // For other file types (svg, gif), simply update path.
      // Before: `../img/post/hello.jpg`
      // After: `/img/hello.jpg`
      newSrc = '/img/' + src.substring(src.lastIndexOf("/") + 1)
      img.attr('src', newSrc)
    }
  })

  /*
  Set image width/height attributes
  First we have to create an array we can iterata over.
  Each array item is an object with 1) Cheerio image object, and 2) image path.
  We get the image's width/height using sharp, then assign width/height attributes.
  We use Promise.all() to wait for all to complete before `return content`.
  */

  let imagesArray = []

  images.each(function (i, el) {
    const img = $(this)
    const src = img.attr('src')
    imagesArray.push({
      cheerioObj: img,
      src: src
    })
  })

  await Promise.all(
    imagesArray.map(async image => {
      try {
        let metadata = await sharp(`_site${image.src}`).metadata()
        image.cheerioObj.attr('width', metadata.width)
        image.cheerioObj.attr('height', metadata.height)
      } catch (err) {
        console.log(err)
      }
    })
  )

  content = $.html()
  return content
}
