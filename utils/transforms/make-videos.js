const colors = require('colors')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

/**
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
  // const videosWithoutFigures = $('main article *:not(figure) video')
  // videosWithoutFigures.each((index, v) => {
  //   $(v).wrap('<figure></figure>')
  // })

  // Copy media files to destination directory.
  // Update src paths.
  const sources = $('main video source')
  sources.each((index, s) => {
    const src = $(s).attr('src')
    if (!src) return true
    const sourcePath = path.resolve(inputDir, src)
    const sourceExists = fs.existsSync(sourcePath)
    if (!sourceExists) {
      console.warn(`Media not found: ${src}`.yellow, '- [make-videos.js]')
      return true
    }
    copyMediaToDestination(sourcePath, '_site/video')
    $(s).attr('src', `/video/${path.basename(src)}`)
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
