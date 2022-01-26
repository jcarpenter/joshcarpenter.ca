const cheerio = require('cheerio')
const fs = require("fs")
const path = require("path")
const sharp = require('sharp')
const { colors } = require('colors')

/**
 * Updated `og:image` meta tag with working URL to specified image.
 * Initial og:image is set by frontmatter `image` field.
 * This transform then updates it to a full working URL on 
 * joshcarpenter.ca, and adds width and height meta tags.
 */
module.exports = async function (content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  const $ = cheerio.load(content)
  const ogImageTag = $('head meta[property="og:image"]')

  // Confirm that the image specified on og:image exists locally.
  const src = $(ogImageTag).attr('content')
  if (src) {
    var { url, width, height } = await getImageDetails(path.basename(src), this.inputPath)
  }

  // If image does not exist locally,
  // throw warning and return.
  if (!url) {
    console.warn(`Meta og:image image not found: ${src}`.yellow, '- [set-of-image.js]')
    return content
  }

  // Update og:image value to working URL on joshcarpenter.ca
  $(ogImageTag).attr('content', url)

  // Add with and height meta tags
  $(ogImageTag).after(`<meta property="og:image:height" content="${height}">`)
  $(ogImageTag).after(`<meta property="og:image:width" content="${width}">`)

  // Return content
  content = $.html()
  return content
}


/**
 * 
 * @param {string} basename - E.g. "chromevr-screenshot.png"
 * @returns 
 */
async function getImageDetails(basename) {

  // 1) Filter images in output directory to ones that match filename.
  // 2) Sort matches from large to small
  // 3) Get first (largest) image.
  let optimizedImgFilename = fs.readdirSync('_site/img')
    .filter((i) => {
      return path.parse(i).name.includes(path.parse(basename).name)
    })
    ?.sort((a, b) => {
      // Sort matchest from large to small
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })[0]

  // If we've found an optimized image, return the details.
  if (optimizedImgFilename) {
    const optimizedImgPath = path.resolve("_site/img/", optimizedImgFilename)
    const { width, height } = await sharp(optimizedImgPath).metadata()
    return {
      url: `https://joshcarpenter.ca/img/${optimizedImgFilename}`,
      width,
      height
    }
  }

  // Else, return false
  return false

}