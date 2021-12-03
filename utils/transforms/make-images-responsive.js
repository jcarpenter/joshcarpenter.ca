const { colors } = require('colors')
const cheerio = require('cheerio')
const fs = require('fs')
const getOptimizedImages = require('../getOptimizedImages')
const path = require('path')

/**
 * Modify images tags inside main > article to be responsive.
 * For each image, find matching optimmized images (matching
 * file names), and update image tags accordingly:
 * - Convert to <picture>, if there are multiple images.
 * - Add `width` and `height` attributes.
 * - ...e tc
 */
module.exports = async function (content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  // Get all optimized images. These are created by
  // optimizeImages.js build step, before eleventy runs.
  let optimizedImages = getOptimizedImages()

  // Find images
  const $ = cheerio.load(content)
  const images = $('main article img')

  if (!images.length) return content

  // Find images with matching names in output img directory
  // Based on images we find, make image responsive.
  images.each((index, img) => {

    const src = $(img).attr('src')
    const title = $(img).attr('title')

    const source = {
      // browser.jpg
      base: path.basename(src),
      // browser
      name: path.parse(src).name,
      // .jpg
      ext: path.parse(src).ext
    }

    // Find optimized version of source
    const matches = optimizedImages.filter((optimizedImg) => {
      return optimizedImg.name.includes(source.name)
    })

    // If no optimized images found, warn, and skip.
    if (!matches.length) {
      console.warn(`No optimized images found for ${src} in ${path.basename(this.inputPath)}`.yellow, '- [make-images-responsive.js]')
      return true
    }

    // Swap title and alt attributes.
    // If img has `title` text, swap `title` to `alt``.
    // We have to do this because of limits in Markdown figures syntax:
    // E.g. `![Caption text](image-path.jpg "Title text")`.
    // We don't have way to define `alt`. So instead we use `title`,
    // and then swap in this step.
    if (title) {
      $(img).attr('alt', title)
      $(img).removeAttr('title')
    }

    const isFirstImage = index == 0
    const isGif = source.ext.toUpperCase().includes('GIF')
    const isSvg = source.ext.toUpperCase().includes('SVG')
    const isBitmap = source.ext.toUpperCase().includes('PNG') || source.ext.toUpperCase().includes('JPG') || source.ext.toUpperCase().includes('JPEG')

    if (isGif) {

      // Update img attributes
      $(img).attr('src', `/img/${matches[0].base}`)
      $(img).attr('width', matches[0].width)
      $(img).attr('height', matches[0].height)
      $(img).attr('loading', `${isFirstImage ? 'eager' : 'lazy'}`)
      $(img).attr('decoding', 'async')

    } else if (isSvg) {

      // TODO

    } else if (isBitmap && matches.length == 1) {

      // Update img attributes
      $(img).attr('src', `/img/${matches[0].base}`)
      $(img).attr('width', matches[0].width)
      $(img).attr('height', matches[0].height)
      $(img).attr('loading', `${isFirstImage ? 'eager' : 'lazy'}`)
      $(img).attr('decoding', 'async')
      // console.log(`${source.base}`.green)
      
    } else if (isBitmap && optimizedImages.length > 1) {

      matches.sort((a, b) => {
        // Sort matchest from small to large
        if (a.width < b.width) return -1
        if (a.width > b.width) return 1
        return 0
      })

      const small = matches[0]
      const large = matches[matches.length - 1]

      // Make `picture` element
      let picture = $('<picture></picture>')
      let source_1x = $(`<source srcset="/img/${small.base}" media="(-webkit-max-device-pixel-ratio: 1)" />`)
      let source_23x_small = $(`<source srcset="/img/${small.base}" media="(-webkit-min-device-pixel-ratio: 2) and (max-width: 450px)" />`)
      let source_23x_large = $(`<source srcset="/img/${large.base}" media="(-webkit-min-device-pixel-ratio: 2) and (min-width: 451px)" />`)

      // Make fallback `img` element.
      let pic_img = $(`<img src="/img/${large.base}" width="${large.width}" heigth="${large.height}" />`)
      if ($(img).attr('alt')) pic_img.attr('alt', alt)
      if ($(img).attr('title')) pic_img.attr('title', title)
      pic_img.attr('loading', `${isFirstImage ? 'eager' : 'lazy'}`)
      pic_img.attr('decoding', 'async')

      // Append all to picture
      picture.append(source_1x)
      picture.append(source_23x_small)
      picture.append(source_23x_large)
      picture.append(pic_img)

      // Replace img with picture
      $(img).replaceWith(picture)
    }

  })

  content = $.html()
  return content
}