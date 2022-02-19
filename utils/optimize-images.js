const cheerio = require("cheerio");
const colors = require("colors");
const fs = require("fs");
const path = require('path');
const imageSize = require("image-size");
const optimizeSvg = require("./optimize-svg");
const copyImage = require("./copy-image");
const optimizeBitmap = require("./optimize-bitmap");

/**
 * Save images and update HTML.
 * Runs after eleventy has output HTML.
 * 
 * 1. Save SVG, GIF, video posters, and og:image meta tag.
 * 2. Save optimized versions of <img> png and jpegs
 * 3. Update html as necessary. E.g. convert img's to 
 * pictures, add width and height attributes, etc.
 * 
 * Save images as follows...
 * - <img> .svg -> optimized svg
 * - <img> .gif -> copy unmodified
 * - <video> poster -> copy unmodified
 * - og:image && png -> jpg
 * - og:image && jpg -> copy unmodified
 * - <img> "thumb.xxx" -> webp, jpg
 * - <img> .jpg -> webp and copy jpg unmodified
 * - <img> .png -> webp and jpg
 * 
 */
(async function () {

  const { globby } = await import("globby")
  const htmlFiles = await globby("./_site/**/*.html", { absolute: true })


  /* -------------------------------------------------------------------------- */
  /*                         SVG, GIF, Poster, OG:Image                         */
  /* -------------------------------------------------------------------------- */

  for (let htmlPath of htmlFiles) {

    const $ = cheerio.load(fs.readFileSync(htmlPath, "utf8"))

    // Get images and videos
    const images = $("img")
    const videos = $("video")

    // ------ Optimize SVGs. Copy GIFs ------ //

    images.each((index, img) => {
      const src = $(img).attr("src")
      const ext = path.extname(src)
      if (ext == ".svg") {
        optimizeSvg(src)
      } else if (ext == ".gif") {
        console.warn(`Should convert GIF to video:`.cyan, src.brightCyan.underline, '- optimize-image.js')
        copyImage(src)
      }
    })

    // ------ Copy video posters ------ //

    videos.each((index, video) => {
      const poster = $(video).attr("poster")
      if (!poster) {
        console.warn(`Video poster missing in:`.cyan, htmlPath.brightCyan.underline, path.basename(__filename))
      } else {
        copyImage(poster)
      }
    })

    // ------ Optimize meta og:image ------ //

    // - Optimize image if it's a PNG. Copy if it's a JPG.
    // - Rename to `name-of-article.jpg`
    // - Resize if width/height !== 1200x630.
    // - Update path to same path on joshcarpenter.ca
    const ogImage = $('head meta[property="og:image"]')
    const ogImageSrc = $(ogImage)?.attr("content")
    if (!ogImageSrc) {
      console.warn(`Meta og:image missing in:`.cyan, htmlPath.brightCyan.underline, path.basename(__filename))
      $(ogImage)?.remove()
    } else {
      
      // Avoid naming conflicts when we use the same image in an article
      // and in the og:image tag by renaming the og:image version, and
      // saving into /img/meta
      // Generate new name from htmlPath. 
      // Get the segment before the "/index.html"
      // From "/Users/josh/Portfolio/_site/rising-seas/index.html"
      // we get "rising-seas"
      // Our meta image file name will be "rising-seas.jpg"
      // Demo: https://regex101.com/r/FZv5lW/1
      
      let url = htmlPath.match(/[^\/]+?(?=\/index\.html)/m)[0]
      if (url == "_site") url = "home"
      const filename = `meta-${url}.jpg`
      
      // Optimize or copy image
      optimizeBitmap(ogImageSrc, false, true, 1200, 630, filename)

      // Upate path
      const { dir } = path.parse(ogImageSrc)
      $(ogImage).attr('content', `https://joshcarpenter.ca${dir}/${filename}`)
    }

    // ------ Write changes ------ //

    fs.writeFileSync(htmlPath, $.html())
  }


  /* -------------------------------------------------------------------------- */
  /*                 Optimize PNG and JPGs for picture elements                 */
  /* -------------------------------------------------------------------------- */

  let outputImages = await globby("./_site/img/**/*", { absolute: true })
  let inputPaths = []
  let parallelOptimizations = []

  // Get PNG and JPG src paths
  for (let htmlPath of htmlFiles) {
    const $ = cheerio.load(fs.readFileSync(htmlPath, "utf8"))
    const images = $("img")
    images.each((index, img) => {
      const src = $(img).attr("src")
      const ext = path.extname(src)
      if (ext == ".png" || ext == ".jpg") inputPaths.push(src)
    })
  }

  for (const src of inputPaths) {

    // Skip if image is already optimized
    const srcWithoutExt = src.replace(/\.[^/.]+$/, "")
    const isAlreadyOptimized = outputImages.some((i) => i.includes(srcWithoutExt))
    if (isAlreadyOptimized) continue

    // Warn and skip if source image does not exist
    const absoluteSourcePath = path.join(process.cwd(), "src", src)
    const sourceExists = fs.existsSync(absoluteSourcePath)
    if (!sourceExists) {
      console.warn("Source image missing:".cyan, src.brightCyan.underline, path.basename(__filename))
      continue
    }

    const isThumb = path.parse(src).name == "thumb"
    const ext = path.extname(src)

    // Resize thumbs to 900px and save both WebP and JPG versions
    if (isThumb) {
      parallelOptimizations.push(optimizeBitmap(src, true, true, 900))
      continue
    }

    // Copy JPEGs unmodified and save WebP version
    if (ext == ".jpg" || ext == ".jpeg") {
      copyImage(src)
      parallelOptimizations.push(optimizeBitmap(src, true, false))
      continue
    }

    // Else, if PNG, save both WebP and JPEG versions
    if (ext == ".png") {
      parallelOptimizations.push(optimizeBitmap(src, true, true))
    }
  }

  // Optimize images in parallel
  await Promise.all(parallelOptimizations)


  /* -------------------------------------------------------------------------- */
  /*                          Change img's to pictures                          */
  /* -------------------------------------------------------------------------- */

  // Change <img> elements to <pictures>, with <source> children for 
  // optimized webp and jpeg versions of the original image, and
  // other attributes (e.g. width and height on fallback jpeg)
  
  // Get updated outputImages
  outputImages = await globby("./_site/img/**/*", { absolute: true })

  for (let htmlPath of htmlFiles) {

    const $ = cheerio.load(fs.readFileSync(htmlPath, "utf8"))
    const images = $("img")

    images.each((index, img) => {

      const src = $(img).attr("src")
      const ext = path.extname(src)

      // Skip SVG and GIFs
      if (ext == ".svg" || ext == ".gif") return true
      
      // Get width and height of output image
      // Skip if optimized image is not found
      const srcWithoutExt = src.replace(/\.[^/.]+$/, "")
      const outputImage = outputImages.find((i) => i.includes(srcWithoutExt))
      if (!outputImage) {
        console.warn("Optimized image not found for:".cyan, src.brightCyan.underline, path.basename(__filename))
        return true
      }
      const { width, height } = imageSize(outputImage)

      // Make picture element and children
      let picture = $('<picture></picture>')
      let source_webp = $(`<source srcset="${srcWithoutExt}.webp" type="image/webp">`)
      let source_jpeg = $(`<source srcset="${srcWithoutExt}.jpg" type="image/jpeg">`)
      let fallback_img = $(`<img src="${srcWithoutExt}.jpg">`)

      // Copy alt and title attributes to pic_img
      if ($(img).attr('alt')) fallback_img.attr('alt', $(img).attr('alt'))
      if ($(img).attr('title')) fallback_img.attr('title', $(img).attr('title'))

      // picture.attr('loading', `${isFirstImage ? 'eager' : 'lazy'}`)

      // Add `decoding` attribute to fallback img
      fallback_img.attr('decoding', 'async')

      // Add width and height attributes to fallback img
      fallback_img.attr('width', width)
      fallback_img.attr('height', height)

      // Copy data-lightbox attribute to picture
      if ($(img).attr('data-lightbox') !== undefined) {
        picture.attr('data-lightbox', 'true')
      }

      // Append children all to picture
      picture.append(source_webp)
      picture.append(source_jpeg)
      picture.append(fallback_img)

      // Replace img with picture
      $(img).replaceWith(picture)

    })

    // Write changes
    fs.writeFileSync(htmlPath, $.html())

  }

})()
