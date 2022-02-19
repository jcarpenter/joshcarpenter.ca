const colors = require('colors')
const fs = require('fs')
const imageSize = require('image-size')
const path = require('path/posix')
const sharp = require('sharp')
// const { optimize: svgo } = require('svgo')

const smallRes = 800
const mediumRes = 1200
const largeRes = 2000

/**
 * Save body images to output _site/img directory,
 * either by optimizing the, or copying them unmodified.
 * @param {*} sourcePath - Absolute local file path
 */
module.exports = async function (sourcePath) {

  const { width, height, type } = imageSize(sourcePath)

  const source = {
    path: sourcePath, // "img/browser.jpg"
    base: path.basename(sourcePath), // "browser.jpg"
    name: path.parse(sourcePath).name, // "browser"
    ext: path.parse(sourcePath).ext, // ".jpg"
    type, // "jpg"
    width, // 1280
    height // 720
  }

  const isJpg = source.type == 'jpg'
  const isPng = source.type == 'png'

  // If it's a gif, or a video poster image, copy unmodified
  // Video poster images I make by hand.
  if (source.type == 'gif' || source.name.endsWith("-poster")) {
    copyUnmodified(source)
    return
  }

  // Else, if it's PNG or JPG, what we do depends on resolution...
  if (source.width >= smallRes && source.width < mediumRes) {

    // Make small version, without resizing
    if (isJpg) {
      copyUnmodified(source, `${source.name}-S`)
    } else {
      saveJpeg(source, `${source.name}-S`, false)
    }

  } else if (source.width >= mediumRes && source.width < largeRes) {

    // Make small version with resize
    // Make medium version without resize
    if (isJpg) {
      saveJpeg(source, `${source.name}-S`, smallRes)
      copyUnmodified(source, `${source.name}-M`)
    } else {
      saveJpeg(source, `${source.name}-S`, smallRes)
      saveJpeg(source, `${source.name}-M`, false)
    }

  } else if (source.width >= largeRes) {

    // Make small and medium versions with resize
    // Make large version without resize
    if (isJpg) {
      saveJpeg(source, `${source.name}-S`, smallRes)
      saveJpeg(source, `${source.name}-M`, mediumRes)
      copyUnmodified(source, `${source.name}-L`)
    } else {
      saveJpeg(source, `${source.name}-S`, smallRes)
      saveJpeg(source, `${source.name}-M`, mediumRes)
      saveJpeg(source, `${source.name}-L`, false)
    }

  }
}


/**
 * Copy source image to output img directory.
 * @param {object} source
 * @param {string} filename - Without extension. E.g. "lake-M"
 */
function copyUnmodified(source, filename = undefined) {
  // If filename is not defined, re-use existing name.
  if (!filename) filename = source.name
  const outputPath = path.resolve('_site/img', filename + source.ext)
  // Return if file already exists
  if (fs.existsSync(outputPath)) return
  fs.copyFileSync(source.path, outputPath, fs.constants.COPYFILE_EXCL)
}

/**
 * Convert source PNG to JPEG. 
 * Resize if `resize` value is defined
 * @param {object} source
 * @param {string} filename - Without extension. E.g. "lake-M"
 * @param {number} resize - 800
 */
async function saveJpeg(source, filename, resize = false) {
  // const filenameSize = resize ? resize : source.width
  // const outputPath = path.resolve('_site/img', `${filename}-${filenameSize}.jpg`)
  const outputPath = path.resolve('_site/img', `${filename}.jpg`)
  // Return if file already exists
  if (fs.existsSync(outputPath)) return
  if (resize) {
    await sharp(source.path)
      .resize({
        width: resize,
        kernel: sharp.kernel.lanczos3,
        fastShrinkOnLoad: true
      })
      // .sharpen()
      // .gamma()
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(outputPath)
  } else {
    await sharp(source.path)
      .jpeg({ quality: 90 })
      .toFile(outputPath)
  }
}









/**
 * Save optimized versions of source bitmap.
 * If original width is <1200, do not resize.
 * If original is >=1200, create 900 and 1200-1700 variations.
 * @param {*} source 
 */
async function makeBitmap(source) {



  // If original width is <1200, use original.
  // Else, if original width is >=1200, create two variations:
  // 900, and 1200-1700

  if (source.width < 1200) {

    if (source.type == 'jpg') {
      // Copy jpg, unmodified
      const outputPath = path.resolve('_site/img', `${source.name}-${source.width}.jpg`)
      fs.copyFileSync(source.path, outputPath, fs.constants.COPYFILE_EXCL)
    } else if (source.type == 'png') {
      // Convert png to jpg. Don't resize.
      const outputPath = path.resolve('_site/img', `${source.name}-${source.width}.jpg`)
      if (!fs.existsSync(outputPath)) {
        await sharp(source.path)
          .jpeg({ quality: 90 })
          .toFile(outputPath)
      }
    }

  } else if (source.width >= 1200) {

    // Create small (900) variation
    // const outputPath = path.resolve('_site/img', `${source.name}-900.jpg`)
    // if (!fs.existsSync(outputPath)) {
    //   await sharp(source.path)
    //     .resize(900)
    //     .jpeg({ quality: 90 })
    //     .toFile(outputPath)
    // }

    // Create large variation
    // If original is >1700, resize down to 1600.
    // Else, if <1700 && jpg, copy unmodified
    // Else, if <1700 && png, convert to jpg.

    if (source.width > 1700) {
      // Resize to 1600 jpg
      const outputPath = path.resolve('_site/img', `${source.name}-1600.jpg`)
      if (!fs.existsSync(outputPath)) {
        await sharp(source.path)
          .resize(1600)
          .jpeg({ quality: 90 })
          .toFile(outputPath)
      }
    } else {
      if (source.type == 'jpg') {
        // Copy jpg unmodified
        const outputPath = path.resolve('_site/img', `${source.name}-${source.width}.jpg`)
        fs.copyFileSync(source.path, outputPath, fs.constants.COPYFILE_EXCL)
      } else if (source.type == 'png') {
        // Convert png to jpg. Don't resize.
        const outputPath = path.resolve('_site/img', `${source.name}-${source.width}.jpg`)
        if (!fs.existsSync(outputPath)) {
          await sharp(source.path)
            .jpeg({ quality: 90 })
            .toFile(outputPath)
        }
      }
    }
  }
}



/**
 * Save optimized version of svg to output img directory.
 */
// function makeSvg(source) {
//   const outputPath = path.resolve('_site/img', source.base)
//   if (!fs.existsSync(outputPath)) {
//     let file = fs.readFileSync(source.path, 'utf8')
//     const result = svgo(file)
//     fs.writeFileSync(outputPath, result.data, (err) => {
//       if (err) console.log(err)
//     })
//     // svgo(file).then((result) => {
//     //   fs.writeFileSync(outputPath, result.data)
//     // })
//   }
// }