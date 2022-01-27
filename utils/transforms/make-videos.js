const colors = require('colors')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const imageSize = require('image-size')
const sharp = require('sharp')

/**
 * Prep video elements by:
 * - Copy source files to destination and update `src` paths
 * - Make autoplay videos lazy-loading, using this technique:
 *   https://web.dev/lazy-loading-video/#video-gif-replacement
 * - Optimizing poster images
 */
module.exports = function (content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  // Get input paths
  const inputDir = path.dirname(this.inputPath) //E.g: src/notes/ocean.md --> src/notes/

  const $ = cheerio.load(content)
  const videos = $('main video')
  
  // If there are no videos, return
  if (!videos.length) return content
  
  // For each video...
  videos.each((index, video) => {


    // --------- Copy video and update source --------- //
    
    // For each <source>...
    // - Copy media files to destination directory.
    // - Update src paths (change to data-src)
    const sources = $(video).find('source')
    sources.each((i, source) => {
      
      const src = $(source).attr('src')
      if (!src) {
        console.warn(`Video src attribute missing`.yellow, '- [make-videos.js]')
        return true
      }

      const sourcePath = path.resolve(inputDir, src)
      const sourceExists = fs.existsSync(sourcePath)
      if (!sourceExists) {
        console.warn(`Video source not found: ${src}`.yellow, '- [make-videos.js]')
        return true
      }
      
      // Copy video to destination
      copyMediaToDestination(sourcePath, '_site/video')

      // Update src path
      $(source).attr('src', `/video/${path.basename(src)}`)      
    })


    // --------- Make autoplay videos lazy-loading --------- //

    const isAutoplay = $(video).attr('autoplay') 
    if (isAutoplay) {
      // Add `lazy` class
      $(video).addClass('lazy')
      // Copy `srv` value to `data-src`, then delete `src`
      sources.each((i, source) => {
        $(source).attr('data-src', $(source).attr('src'))
        $(source).removeAttr('src')
      })
      // Add video-lazy-load.js, if it doesn't already exist
      const scriptAlreadyExists = $('head script[src*=video-lazy-load]').length
      if (!scriptAlreadyExists) {
        $('head').append('<script src="/js/video-lazy-load.js"></script>')
      }
    }


    // --------- Optimize poster images --------- //

    // If video has `poster` attribute, optimize image and update path
    // Else, throw warning.
    const poster = $(video).attr('poster')
    if (poster == undefined) {
      // If poster attribute is missing, throw warning
      console.warn(`A video is missing a poster attribute in: ${this.outputPath}`.yellow, '- [make-videos.js]')
    } else {
      
      // If poster attribute is present, confirm it exists...

      const posterPath = path.resolve(inputDir, poster)
      const posterExists = fs.existsSync(posterPath)
      
      if (!posterExists) {
        
        // If specified poster image does not exist, throw warning
        console.warn(`Video poster image not found: ${poster} in ${this.inputPath}`.yellow, '- [make-videos.js]')

      } else {
        
        // If poster image does exist, load it with imageSize,
        // and either optimize as JPEG (if it's a PNG), or 
        // simply copy to output direcory (if it's already JPEG).
        // Then update poster attribute if necessary,
        // and add `width` and `height` attributes.
        const { width, height, type } = imageSize(posterPath)
        if (type == 'png') {
          optimizePosterAsJpeg(posterPath, '_site/video')
          const filename = path.parse(poster).name + '.jpg'
          $(video).attr('poster', `/video/${filename}`)
        } else {
          copyMediaToDestination(posterPath, '_site/video')
          const filename = path.basename(poster)
          $(video).attr('poster', '/video/' + filename)
        }
      }
    }
  })

  content = $.html()
  return content
}

/**
 * Save a PNG poster image as a JPEG
 * @param {*} posterPath 
 * @param {*} destinationDirectory 
 */
async function optimizePosterAsJpeg(posterPath, destinationDirectory) {

  const filename = path.parse(posterPath).name + '.jpg'
  const outputPath = path.resolve(destinationDirectory, filename)

  // If output file already exists, do nothing (don't overwrite)
  if (fs.existsSync(outputPath)) return
  
  await sharp(posterPath)
    .resize({
      width: 1000,
      withoutEnlargement: true
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath)
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
