const colors = require('colors')
const cheerio = require('cheerio')
const fs = require("fs")
const path = require("path")
const imageSize = require("image-size")

/**
 * Update og:image tags:
 * - Update `content` path to image on joshcarpenter.ca
 * - Add width and height tags
 */
module.exports = async function (content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  const $ = cheerio.load(content)
  
  // Get the starting og:image tag and `content` value
  const ogImageTag = $('head meta[property="og:image"]')
  const src = $(ogImageTag)?.attr('content')
  
  // If og:image is empty or missing, throw warning and remove the og:image tag
  if (!src) {
    console.warn(`meta_image not specified in ${this.inputPath}`.yellow, '- [set-meta-image.js]')
    $(ogImageTag).remove()
    return content
  }

  // Confirm specified image exists in _site/img
  const filename = path.parse(src).name + '.jpg'
  const outputPath = path.resolve('_site/img', filename)
  const outputExists = fs.existsSync(outputPath)
  
  // If output image is missing from _site/img, throw warning 
  // and remove the og:image tag
  if (!outputExists) {
    console.warn(`meta_image not found in _site/img: ${filename}. From ${this.inputPath}`.yellow, '- [set-meta-image.js]')
    $(ogImageTag).remove()
    return content
  } 
  
  // Get image details
  const { type, width, height } = imageSize(outputPath)

  // Update og:image `content` value to URL of the output image
  // on joshcarpenter.ca.
  $(ogImageTag).attr('content', `https://joshcarpenter.ca/img/${filename}`)

  // Add with and height meta tags
  $(ogImageTag).after(`<meta property="og:image:height" content="1200">`)
  $(ogImageTag).after(`<meta property="og:image:width" content="630">`)

  // Return content
  content = $.html()
  return content
}
