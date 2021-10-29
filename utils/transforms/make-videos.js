const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const { off } = require('process')

/**
 * Wrap <video> elements and in figures, if they're not already.
 * Copy source files to destination and update src paths.
 */
module.exports = function (content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  // Get input paths
  const inputPath = this.inputPath
  const inputDir = path.dirname(inputPath) //E.g: src/notes/ocean.md --> src/notes/

  const $ = cheerio.load(content)

  // Wrap video elements in figures, if they're not already.
  const videosWithoutFigures = $('#post #content *:not(figure) video')
  videosWithoutFigures.each((index, v) => {
    $(v).wrap('<figure></figure>')
  })

  // Copy media files to destination directory
  // and update src paths
  const sources = $('#post #content video source')
  sources.each((index, s) => {
    const src = $(s).attr('src')
    if (!src) return true
    const sourcePath = path.resolve(inputDir, src)
    const sourceExists = fs.existsSync(sourcePath)
    if (!sourceExists) {
      console.warn(`Media not found: ${src}`)
      return true
    }
    copyMediaToDestination(sourcePath, '_site/media')
    $(s).attr('src', `/media/${path.basename(src)}`)
  })

  content = $.html()
  return content
}


/**
 * Copy media from source to destination
 * @param {*} sourcePath - Full path on disk of source image
 * @param {*} destinationDirectory - Directory to copy file to
 */
 function copyMediaToDestination(sourcePath, destinationDirectory) {

  // Make sure destination directory exists
  const siteImgDirExists = fs.existsSync(destinationDirectory)
  if (!siteImgDirExists) {
    fs.mkdirSync(destinationDirectory)
  }
  
  // Copy media file to destination directory,
  // if it doesn't already exist
  const destinationPath = path.resolve(destinationDirectory, path.basename(sourcePath))
  if (!fs.existsSync(destinationPath)) {
    fs.copyFile(sourcePath, destinationPath, (err) => {
      if (err) console.log(err)
    })
  }
}



/**
 * Convert webm figures to <video> elements.
 * Find and use mp4 fallback also, if it exists.
 * Copy source files to _site/media/.
 */
// module.exports = function (content) {

//   // Exit early if output path is false, because we aren't 
//   // going to write this doc to disk. Perf savings.
//   if (!this.outputPath) return content

//   // Get input paths
//   const inputPath = this.inputPath
//   const inputDir = path.dirname(inputPath) //E.g: src/notes/ocean.md --> src/notes/

//   const $ = cheerio.load(content)

//   // Find figures that contain videos that have src attributes
//   const figures = $('#post #content figure:has(img)').filter((index, f) => {
//     const img = $(f).find('img')
//     const src = $(img).attr('src')
//     const ext = path.extname(src).toUpperCase()
//     return ext.includes('WEBM') || ext.includes('MP4')
//   })

//   // Replace img with <video>
//   figures.each((index, f) => {

//     const img = $(f).find('img')
//     const src = $(img).attr('src')
//     const sourcePath = path.resolve(inputDir, src)
//     const sourceFileExists = fs.existsSync(sourcePath)

//     // If src image does not exist, skip to the next item 
//     // in the `each` loop, and throw warning.
//     if (!sourceFileExists) {
//       console.warn(`Missing media: ${src}`)
//       return true
//     }

//     // Copy media asset to destination, if it's not already there
//     const destinationPath = path.resolve('_site/media', path.basename(sourcePath))
//     copyMediaToDestination(sourcePath, destinationPath)

//     // Does fallback mp4 exist? 
//     // If yes, copy to destination. Else, throw warning.
//     const fallbackSourcePath = changeExtension(sourcePath, '.mp4')
//     const fallbackSourceFileExists = fs.existsSync(fallbackSourcePath)
//     if (fallbackSourceFileExists) {
//       var fallbackDestinationPath = path.resolve('_site/media', path.basename(fallbackSourcePath))
//       copyMediaToDestination(fallbackSourcePath, fallbackDestinationPath)
//     } else {
//       console.warn(`Missing expected fallback mp4 file: ${fallbackSourcePath}`)
//     }

//     // Replace img with <video> and add sources
//     $(img).replaceWith(`<video playsinline autoplay loop muted></video>`)
//     const video = $(f).find('video')
//     $(video).append(`<source src="/media/${path.basename(destinationPath)}" type="video/webm; codecs=vp9,opus" />`)
    
//     // If fallback exists, add it as source
//     if (fallbackSourceFileExists) {
//       $(video).append(`<source src="/media/${path.basename(fallbackDestinationPath)}" type="video/mp4" />`)
//     }
//   })

//   content = $.html()
//   return content
// }



// /**
//  * Utility method: change extension of path
//  * @param {string} file 
//  * @param {string} extension 
//  * @returns 
//  */
// function changeExtension(file, extension) {
//   const basename = path.basename(file, path.extname(file))
//   return path.join(path.dirname(file), basename + extension)
// }