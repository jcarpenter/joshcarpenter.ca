const cheerio = require('cheerio')
const path = require('path')
const fs = require('fs')
const imageSize = require('image-size')
const sharp = require('sharp')
const { optimize: svgo } = require('svgo')
const { colors } = require('colors')
sharp.cache(false)
// Make images in posts responsive
// For each image inside main > article
// 1) Add responsive attributes
// 2) Generate image assets, if they don't already exist

module.exports = async function (content, outputPath) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!outputPath) return content

  const inputPath = this.inputPath
  const inputDir = path.dirname(inputPath) //E.g: src/notes/ocean.md --> src/notes/

  // If file was NOT generated from markdown, return
  const inputIsMarkdown = this.parsed.ext == '.md'
  if (!inputIsMarkdown) return content

  // Find images
  const $ = cheerio.load(content)
  const images = $('#post #content img')

  // TEMP
  // if (!this.inputPath.includes('src/notes/desk.md')) {
  //   return content
  // }

  // For each image in the markdown, start to process...
  // We have to use promises here because the processing function
  // needs to use async code when loading and saving images, but
  // cheerio doesn't support async.
  // Per: https://github.com/cheeriojs/cheerio/issues/752

  let promises = []
  images.each(async function (index, img) {

    const src = $(img).attr('src')
    const ext = path.extname(src)
    const alt = $(img).attr('alt')
    const title = $(img).attr('title')
    const isFirstImage = index == 0

    const isGif = ext.toUpperCase().includes('GIF')
    const isSvg = ext.toUpperCase().includes('SVG')
    const isBitmap = ext.toUpperCase().includes('PNG') || ext.toUpperCase().includes('JPG') || ext.toUpperCase().includes('JPEG')
    const isVideo = ext.toUpperCase().includes('WEBM') || ext.toUpperCase().includes('MP4')

    // If source is video, do nothing, and skip to next item. 
    // We handle video elements in a subsequent transform.
    if (isVideo) return true

    const sourcePath = path.resolve(inputDir, src)
    const sourceFileExists = fs.existsSync(sourcePath)

    // If src image does not exist, remove the figure,
    // throw a warning, and skip to the next item in the 
    // `each` loop
    if (!sourceFileExists) {
      console.warn(`Source file ${sourcePath} not found. Was defined in ${path.basename(inputPath)}. Removing <figure>.`.yellow, '[generate-images.js]')
      $(img).parent().remove()
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

    // Process the image (generate variations, update img, etc)
    if (isGif) {
      var promise = processGif($, img, sourcePath, isFirstImage)
    } else if (isSvg) {
      var promise = processSvg($, img, sourcePath, isFirstImage)
    } else if (isBitmap) {
      var promise = processBitmap($, img, sourcePath, isFirstImage)
    }

    promises.push(promise)

  })

  // Wait for all image variations to be created
  // and HTML to be updated...
  await Promise.all(promises)

  // Then return the updated html
  return $.html()

}


/**
 * Copy the specified gif to the output img directory
 * and update the img attributes
 */
function processGif($, img, sourcePath, isFirstImage) {

  return new Promise(async function (resolve, reject) {

    // Get source image details
    const { width, height, type } = imageSize(sourcePath)

    // Copy gif to destination, unmodified
    const destinationPath = path.resolve('_site/img', path.basename(sourcePath))
    copyImageToDestination(sourcePath, destinationPath)

    // Update img attributes
    $(img).attr('src', `/img/${path.basename(destinationPath)}`)
    $(img).attr('width', width)
    $(img).attr('height', height)
    $(img).attr('loading', `${isFirstImage ? 'eager' : 'lazy'}`)
    $(img).attr('decoding', 'async')

    resolve()
  })
}


/**
 * 
 */
function processSvg($, img, sourcePath, isFirstImage) {

  return new Promise(async function (resolve, reject) {

    // Get source image details
    const { width, height, type } = imageSize(sourcePath)

    // Process SVG with SVGO and output to destination
    const destinationPath = path.resolve('_site/img', path.basename(sourcePath))
    let file = fs.readFileSync(sourcePath, 'utf8')
    svgo(file).then((result) => {
      fs.writeFile(destinationPath, result.data, (err) => {
        if (err) console.log(err)
      })
    })

    // Update img attributes
    $(img).attr('src', `/img/${path.basename(destinationPath)}`)
    $(img).attr('width', width)
    $(img).attr('height', height)
    $(img).attr('loading', `${isFirstImage ? 'eager' : 'lazy'}`)
    // img.attr('decoding', 'async')

    resolve()
  })
}


/**
 * Create size/format variations of the original jpeg or png.
 * Add responsive attributes to the <img>, or replace with <picture>.
 */
function processBitmap($, img, sourcePath, isFirstImage) {

  return new Promise(async function (resolve, reject) {

    // Load existing image into Sharp.
    // And get metadata, so we can check size.
    const ext = path.extname(sourcePath)
    const source = await sharp(sourcePath)
    const metadata = await source.metadata()
    const heightMultiplier = metadata.width / metadata.height

    // If original width is <1200, copy original without resizing.
    // and return a non-responsive basic <img> element.

    // Else, if original width is >=1200, create two variations
    // (900px and 1200-1600px), and return a <picture> element.

    if (metadata.width < 1200) {

      // If original is PNG w/o alpha, convert to JPEG.
      // Else, copy original without changes.
      if (metadata.format == 'png' && !metadata.hasAlpha) {
        var filename = `${path.basename(sourcePath, ext)}-${metadata.width}.jpg`
        source.jpeg({ quality: 85 }).toFile(path.resolve('_site/img', filename))
      } else {
        var filename = `${path.basename(sourcePath, ext)}-${metadata.width}.${metadata.format}`
        copyImageToDestination(sourcePath, path.resolve('_site/img', filename))
      }

      // Update img attributes
      $(img).attr('src', `/img/${filename}`)
      $(img).attr('width', metadata.width)
      $(img).attr('height', metadata.height)
      $(img).attr('loading', `${isFirstImage ? 'eager' : 'lazy'}`)
      $(img).attr('decoding', 'async')

    } else if (metadata.width >= 1200) {

      // Make `picture` element
      let picture = $('<picture></picture>')

      // Create "small" 900px variation
      // If original is PNG w/o alpha, resize and convert to JPEG.
      // Else, resize and leave in original format.
      if (metadata.format == 'png' && !metadata.hasAlpha) {
        var smallFilename = `${path.basename(sourcePath, ext)}-900.jpg`
        const destinationPath = path.resolve('_site/img', smallFilename)
        if (!fs.existsSync(destinationPath)) source.resize(900).jpeg({ quality: 85 }).toFile(destinationPath)
      } else if (metadata.format == 'jpeg') {
        var smallFilename = `${path.basename(sourcePath, ext)}-900.jpg`
        const destinationPath = path.resolve('_site/img', smallFilename)
        if (!fs.existsSync(destinationPath)) source.resize(900).jpeg({ quality: 85 }).toFile(destinationPath)
      } else if (metadata.format == 'png' && metadata.hasAlpha) {
        var smallFilename = `${path.basename(sourcePath, ext)}-900.png`
        const destinationPath = path.resolve('_site/img', smallFilename)
        if (!fs.existsSync(destinationPath)) source.resize(900).png().toFile(destinationPath)
      }

      // Create "large" (1200-1600px) variation
      // If original is >1600, resize down to 1600.
      // Else, use original size.
      // If original is PNG w/o alpha, convert to JPEG.
      // Else, leave in original format, and don't optimize.
      if (metadata.width > 1600) {
        var largeWidth = 1600, largeHeight = Math.round(1600 / heightMultiplier)
        if (metadata.format == 'png' && !metadata.hasAlpha) {
          var largeFilename = `${path.basename(sourcePath, ext)}-1600.jpg`
          const destinationPath = path.resolve('_site/img', largeFilename)
          if (!fs.existsSync(destinationPath)) source.resize(1600).jpeg({ quality: 85 }).toFile(destinationPath)
        } else if (metadata.format == 'jpeg') {
          var largeFilename = `${path.basename(sourcePath, ext)}-1600.jpg`
          const destinationPath = path.resolve('_site/img', largeFilename)
          if (!fs.existsSync(destinationPath)) source.resize(1600).jpeg({ quality: 85 }).toFile(destinationPath)
        } else if (metadata.format == 'png' && metadata.hasAlpha) {
          var largeFilename = `${path.basename(sourcePath, ext)}-1600.png`
          const destinationPath = path.resolve('_site/img', largeFilename)
          if (!fs.existsSync(destinationPath)) source.resize(1600).png().toFile(destinationPath)
        }
      } else {
        var largeWidth = metadata.width, largeHeight = metadata.height
        if (metadata.format == 'png' && !metadata.hasAlpha) {
          var largeFilename = `${path.basename(sourcePath, ext)}-${metadata.width}.jpg`
          const destinationPath = path.resolve('_site/img', largeFilename)
          if (!fs.existsSync(destinationPath)) source.jpeg({ quality: 85 }).toFile(destinationPath)
        } else if (metadata.format == 'jpeg') {
          var largeFilename = `${path.basename(sourcePath, ext)}-${metadata.width}.jpg`
          const destinationPath = path.resolve('_site/img', largeFilename)
          copyImageToDestination(sourcePath, destinationPath)
        } else if (metadata.format == 'png' && metadata.hasAlpha) {
          var largeFilename = `${path.basename(sourcePath, ext)}-${metadata.width}.png`
          const destinationPath = path.resolve('_site/img', largeFilename)
          copyImageToDestination(sourcePath, destinationPath)
        }
      }


      // Create <source> elements
      let source_1x = $(`<source srcset="/img/${smallFilename}" media="(-webkit-max-device-pixel-ratio: 1)" />`)
      let source_23x_small = $(`<source srcset="/img/${smallFilename}" media="(-webkit-min-device-pixel-ratio: 2) and (max-width: 450px)" />`)
      let source_23x_large = $(`<source srcset="/img/${largeFilename}" media="(-webkit-min-device-pixel-ratio: 2) and (min-width: 451px)" />`)

      // Make fallback `img` element.
      let picImg = $(`<img src="/img/${largeFilename}" width="${largeWidth}" heigth="${largeHeight}" />`)
      if ($(img).attr('alt')) picImg.attr('alt', alt)
      if ($(img).attr('title')) picImg.attr('title', title)
      picImg.attr('loading', `${isFirstImage ? 'eager' : 'lazy'}`)
      picImg.attr('decoding', 'async')

      // Append all to picture
      picture.append(source_1x)
      picture.append(source_23x_small)
      picture.append(source_23x_large)
      picture.append(picImg)

      // Replace img with picture
      $(img).replaceWith(picture)
    }

    resolve()
  })
}







/**
 * Copy image from source to destination
 * @param {*} sourcePath - Full path on disk of source image
 */
function copyImageToDestination(sourcePath, destinationPath) {

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