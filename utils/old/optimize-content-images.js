const colors = require('colors');
const fs = require('fs');
const imageSize = require('image-size')
const matter = require('gray-matter');
const path = require('path');
const sharp = require('sharp')

// Find images in implicit figures format in markdown files
// Demo: https://regex101.com/r/qi8ysh/1/
// const imageInMarkdownImplicitFigureRE = /^!\[.*\]\((?<src>[^\s\)]*)[\s|\)]/gm

// Find images in HTML. With `src` group.
// Demo: https://regex101.com/r/8EhoSo/1
// const imageInHtmlRE = /<img\s[^>]*?src\s*=\s*['\"](?<src>[^'\"]*?)['\"][^>]*?>/gm

// Find <video> in HTML. Includes a regexp group for
// contents of the `poster` attribute.
// Demo: https://regex101.com/r/fq8uke/1
// const videoInHtmlRE = /<video\s[^>]*?poster\s*=\s*['\"](?<poster>[^'\"]*?)['\"][^>]*?>/gm

// Find images in documents. 
// That's any string ending in jpg, png or gif.
const imagePathRE = /[^\]\(\"]*\.(?:jpg|png|gif)/gm

/**
 * Find images in content of markdown and nunjucks templates
 * and return array of absolute paths.
 * Ignore templates without `publish: true` in frontmatter,
 * (and that aren't /includes or /layouts).
 * Get full local paths to images. And de-dupe.
 * Warn on images that aren't found on disk.
 */
async function getContentImages() {

  // Get images from content
  // Resize only the very largest
  // and thunbs.

  const { globby } = await import('globby')

  // Array of posts. Each is path to post.
  let posts = []
  let allImages = []

  // Find all markdown files in src/
  posts.push(...await globby("./src/**/*.md"))

  // Find all Nunjuck files in /src/portfolio and /src/projects
  posts.push(...await globby("./src/**/*.njk"))

  // For each post, find the images and push to `allImages`
  for (const post of posts) {

    // Get content and frontmatter
    const { content, data } = matter.read(post)

    // Skip files without `publish: true` in front matter,
    // (and that aren't /includes or /layouts)
    if (!data.publish && !post.includes("src/includes") && !post.includes("src/layouts")) continue

    // Array of all images in the post
    // Each is a path to the image taken from `src` attribute
    let postImages = []

    // Get images from content
    for (const img of content.matchAll(imagePathRE)) {
      postImages.push(img[0])
    }

    // For each image, confirm that it exists on disk.
    // If yes, then push to `allImages`. Else, warn.
    postImages.forEach((src) => {
      const absolutePath = path.resolve(path.dirname(post), src)
      if (!fs.existsSync(absolutePath)) {
        console.warn('optimize-content-images.js - ', `Image not found on disk:`.yellow, `${absolutePath}`.brightYellow.underline)
      } else {
        allImages.push(absolutePath)
      }
    })
  }

  // Remove dupes
  // Per: https://stackoverflow.com/a/9229821
  allImages = [...new Set(allImages)]

  // console.log(allImages)

  // Alphabetize
  allImages.sort()

  // Return array
  return allImages
}


async function optimizeImage(sourcePath) {

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
  const isGif = source.type == 'gif'
  const isThumb = source.name.endsWith("-thumb")
  const isPoster = source.name.endsWith("-poster")

  // Copy video poster images unmodified. I make these manually.
  if (isPoster) {
    copyUnmodified(source)
    return
  }

  // Copy gifs unmodified, but also warn.
  if (isGif) {
    console.warn('optimize-content-images.js - ', `Image is GIF. Should convert to video:`.yellow, `${source.base}`.brightYellow.underline)
    copyUnmodified(source)
    return

  }

  // Resize thumbs to 800px
  if (isThumb) {
    compress(source, true, true, 900)
    return
  }

  // Copy JPEGs unmodified, and save WebP versions
  if (isJpg) {
    copyUnmodified(source)
    compress(source, true, false)
    return
  }
  
  // Else, save both WebP and JPEG versions
  compress(source, true, true)
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
 * Save compressed webp and jpeg versions of the source image
 * @param {object} source 
 * @param {boolean} compressWebP 
 * @param {boolean} compressJpeg 
 * @param {number} resizeTo 
 * @returns 
 */
async function compress(source, compressWebP = true, compressJpeg = true, resizeTo = undefined) {

  // Create a sharp instance
  const sharpStream = sharp(source.path)

  // Resize, if specified
  if (resizeTo) {
    sharpStream.resize({
      width: resizeTo,
      kernel: sharp.kernel.lanczos3,
      fastShrinkOnLoad: true
    })
  }

  const promises = []

  if (compressWebP) {
    const webpPath = path.resolve('_site/img', `${source.name}.webp`)
    if (fs.existsSync(webpPath)) return
    promises.push(sharpStream.clone().webp({ quality: 85 }).toFile(webpPath))
  }
  
  if (compressJpeg) {
    const jpgPath = path.resolve('_site/img', `${source.name}.jpg`)
    if (fs.existsSync(jpgPath)) return
    promises.push(sharpStream.clone().jpeg({ quality: 90, mozjpeg: true }).toFile(jpgPath))
  }

  // Process
  Promise.all(promises)
}


/**
 * Output optimized versions of images in the `#body` of 
 * markdown and nunjucks templates. The `#body` element is
 * the primary content of our layouts. Ignore templates without
 * `publish: true` in frontmatter.
 */
(async function () {

  // Array of images to optimize.
  // Each entry is string with absolute local path
  let images = []

  // Get images from markdown and nunjucks posts
  images.push(...await getContentImages())

  // Get images from src/img directory
  // images.push(...await globby("./src/img/**", { absolute: true }))

  // Output optimized versions to _site/img
  for (const sourcePath of images) {
    await optimizeImage(sourcePath)
  }

})()
