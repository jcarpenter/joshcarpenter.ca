const colors = require('colors')
const fs = require('fs')
const imageSize = require('image-size')
const path = require('path/posix')
const sharp = require('sharp')
const { optimize: svgo } = require('svgo')

/**
 * Generate optimized version(s) of specified image 
 * to output _site/img directory.
 * @param {*} sourcePath - Absolute local file path
 */
module.exports = async function (sourcePath) {

  const { width, height, type } = imageSize(sourcePath)

  const source = {
    // img/browser.jpg
    path: sourcePath,
    // browser.jpg
    base: path.basename(sourcePath),
    // browser
    name: path.parse(sourcePath).name,
    // .jpg
    ext: path.parse(sourcePath).ext,
    // jpg
    type,
    width,
    height
  }

  switch (source.type) {
    case "gif":
      copyGif(source)
      break
    case "svg":
      makeSvg(source)
      break
    case "jpg":
    case "png":
      await makeBitmap(source)
  }
}


/**
 * Copy gif to output img directory.
 */
function copyGif(source) {
  const outputPath = path.resolve('_site/img', source.base)
  // Copy gif. Do not overwrite, if it already exists.
  fs.copyFileSync(source.path, outputPath, fs.constants.COPYFILE_EXCL)
}

/**
 * Save optimized version of svg to output img directory.
 */
function makeSvg(source) {
  const outputPath = path.resolve('_site/img', source.base)
  if (!fs.existsSync(outputPath)) {
    let file = fs.readFileSync(source.path, 'utf8')
    const result = svgo(file)
    fs.writeFileSync(outputPath, result.data, (err) => {
      if (err) console.log(err)
    })
    // svgo(file).then((result) => {
    //   fs.writeFileSync(outputPath, result.data)
    // })
  }
}

async function makeBitmap(source) {

  // If original width is <1200, use original.
  // Convert PNG to JPG.
  
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
    const outputPath = path.resolve('_site/img', `${source.name}-900.jpg`)
    if (!fs.existsSync(outputPath)) {
      await sharp(source.path)
        .resize(900)
        .jpeg({ quality: 90 })
        .toFile(outputPath)
    }

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
