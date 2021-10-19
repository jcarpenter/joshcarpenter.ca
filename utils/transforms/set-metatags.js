const cheerio = require('cheerio')
const fs = require("fs")
const path = require("path")
const imageSize = require('image-size')
const sharp = require('sharp')
const { colors } = require('colors')

module.exports = async function (content, outputPath) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!outputPath) return content

  const $ = cheerio.load(content)
  const meta = $('head meta[property="og:image"]')
  if (!meta) return content

  // Path specified in image front matter
  // "img/ffos-billboard.jpg"
  const contentAttr = meta.attr('content')
  if (!contentAttr) return content

  // Get extension and basename
  const imgName = path.parse(contentAttr).name

  // Find all variations of the specified image in
  // the output directory.
  // - User specifies: "house.jpg" 
  // - We find "house-1000.jpg", "house-1400.jpg", etc.
  let matchingOptimizedImgs = fs.readdirSync('_site/img').filter((i) => path.parse(i).name.includes(imgName))

  // If the optimized variations of the image have already been 
  // generated, use the largest of them. (This will be the case 
  // when the specified image also appears in-content, as it will
  // be caught by our generate-images transform).

  // Else, if optimizied variations of the specified image DO NOT
  // exist, create one, sized to 1200px width. That is optimal size.
  // Per: https://iamturns.com/open-graph-image-size/

  if (matchingOptimizedImgs.length) {

    // Use largest existing optimized image...

    // Get largest existing optimized image
    const filename = matchingOptimizedImgs.sort((a, b) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })[0]

    // Set it's hosted URL as `content` attribute
    $(meta).attr('content', `https://joshcarpenter/img/${filename}`)

    // Set width and height meta tags
    const { width, height, type } = imageSize(`_site/img/${filename}`)
    meta.after(`<meta property="og:image:height" content="${height}">`)
    meta.after(`<meta property="og:image:width" content="${width}">`)

  } else {

    // Generate optimized image, 1200px wide...

    // Get original image dimensions and type...

    // src/design/chrome-vr.md
    const inputPath = this.inputPath
    // src/design/  
    const inputDir = path.dirname(inputPath)
    // src/design/img/chromevr/chromevr-screenshot.png
    const sourcePath = path.resolve(inputDir, contentAttr)

    // If source file is not found, remove the meta tag
    // and return content
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Source file ${sourcePath} not found. Removing og:image meta tag.`.yellow, '[set-metadata.js]')
      $(meta).remove()
      content = $.html()
      return content
    }

    // Get original image information
    const sourceMetadata = imageSize(sourcePath)

    // Filename of optimized version will be
    const filename = `${imgName}-1200.jpg`
    const destinationPath = path.resolve('_site/img', filename)

    // If source image is >1400, generate resized version
    // Else, if source is PNG, generate JPEG version (without resizing).
    // Else, use original version (copy with new filename to _site/img).
    if (sourceMetadata.width > 1400) {
      if (!fs.existsSync(destinationPath)) {
        await sharp(sourcePath).resize(1200).jpeg({ quality: 85 }).toFile(destinationPath)
      }
    } else if (sourceMetadata.type !== 'jpg') {
      console.log('Not a jpeg')
      if (!fs.existsSync(destinationPath)) {
        await sharp(sourcePath).jpeg({ quality: 85 }).toFile(destinationPath)
      }
    } else {
      // Create destination directory, if it doesn't already exist.
      const siteImgDirExists = fs.existsSync('./_site/img')
      if (!siteImgDirExists) {
        fs.mkdirSync('./_site/img')
      }
      // Copy img, if it doesn't already exist
      if (!fs.existsSync(destinationPath)) {
        fs.copyFile(sourcePath, destinationPath, (err) => {
          if (err) console.log(err)
        })
      }
    }

    // Set it's hosted URL as `content` attribute
    $(meta).attr('content', `https://joshcarpenter/img/${filename}`)

    // Set width and height meta tags
    const { width, height, type } = imageSize(destinationPath)
    meta.after(`<meta property="og:image:height" content="${height}">`)
    meta.after(`<meta property="og:image:width" content="${width}">`)

  }



  content = $.html()
  return content

}

