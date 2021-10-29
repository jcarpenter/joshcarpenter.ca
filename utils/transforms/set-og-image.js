const cheerio = require('cheerio')
const fs = require("fs")
const path = require("path")
const sharp = require('sharp')
const { colors } = require('colors')

/**
 * Create `og:image` meta tag, with working URL,
 * and matching `og:image:width` and `og:image:height` tags.
 * Image can be specified per post in `image` frontmatter field.
 * If not specified, the first image in the post will 
 * automatically be used. Or, if the content is not a post,
 * or the post has no images, a site-wide default is used.
 * Try to use an optimized variation of the image, if one has 
 * already been created. Else, create an optimized variataion.
 */
module.exports = async function (content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  const $ = cheerio.load(content)

  // First, see if image was defined frontmatter `image` field.
  // If yes, og:image `content` property will be populated.
  const src = $('head meta[property="og:image"]').attr('content')
  if (src) {
    var { url, width, height } = await getImageDetails(path.basename(src), this.inputPath)
  }

  // console.log(`${src}`.bgBlue, path.basename(this.inputPath))

  // Else, if image was not specified in frontmatter (or was not found),
  // use first image from the post.
  // if (!url) {
  //   const firstImageSrc = $('#post #content figure img:first-of-type')?.attr('src')
  //   if (firstImageSrc) {
  //     var { url, width, height } = await getImageDetails(firstImageSrc, this.inputPath)
  //   }
  // }

  // // Else, if there are no images to use,
  // // use default site-wide image.
  // if (!url) {
  //   var url = "https://joshcarpenter.ca/img/josh-1-900.jpg"
  //   var width = 900
  //   var height = 635
  // }

  // Insert meta tags
  $('head meta[property="og:title"]').before(`<meta property="og:image" content="${url}">`)
  $('head meta[property="og:image"]').after(`<meta property="og:image:height" content="${height}">`)
  $('head meta[property="og:image"]').after(`<meta property="og:image:width" content="${width}">`)

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


  // // If we haven't found an optimized image, try to generate one,
  // // from the original, unoptimized version.

  // // src/design/  
  // const inputDir = path.dirname(templatePath)
  // // src/design/img/chromevr/chromevr-screenshot.png
  // const originalImgPath = path.resolve(inputDir, specifiedImg)

  // // If source file is not found, throw a warning and return false
  // if (!fs.existsSync(originalImgPath)) {
  //   console.warn(`Source file ${originalImgPath} not found. Removing og:image meta tag.`.yellow, '[set-metadata.js]')
  //   return false
  // }

  // // Get original image information
  // const originalImg = await sharp(originalImgPath)?.metadata()

  // // Set filename and output path of optimized versio
  // const outputFilename = `${path.parse(specifiedImg).name}-1200.jpg`
  // const outputPath = path.resolve('_site/img', outputFilename)

  // // If source image is >1400, generate resized JPEG.
  // // Else, if source is PNG, generate JPEG version (without resizing).
  // // Else, use original version (copy with new filename to _site/img).
  // if (originalImg.width > 1400) {
  //   if (!fs.existsSync(outputPath)) {
  //     await sharp(originalImgPath).resize(1200).jpeg({ quality: 85 }).toFile(outputPath)
  //   }
  // } else if (originalImg.format !== 'jpg') {
  //   if (!fs.existsSync(outputPath)) {
  //     await sharp(originalImgPath).jpeg({ quality: 85 }).toFile(outputPath)
  //   }
  // } else {
  //   // Create destination directory, if it doesn't already exist.
  //   const siteImgDirExists = fs.existsSync('./_site/img')
  //   if (!siteImgDirExists) {
  //     fs.mkdirSync('./_site/img')
  //   }
  //   // Copy img, if it doesn't already exist
  //   if (!fs.existsSync(outputPath)) {
  //     fs.copyFile(originalImgPath, outputPath, (err) => {
  //       if (err) console.log(err)
  //     })
  //   }
  // }

  // // If optimized version was saved successfully, return details
  // if (fs.existsSync(outputPath)) {
  //   // Get metadata for saved image
  //   const { width, height } = await sharp(outputPath).metadata()
  //   return {
  //     url: `https://joshcarpenter.ca/img/${outputFilename}`,
  //     width,
  //     height
  //   }
  // }

  // // If none of the above have worked, return false
  // return false


}