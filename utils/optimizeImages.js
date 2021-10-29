const colors = require('colors')
const fs = require('fs')
const globby = require('globby')
const matter = require('gray-matter')
const optimizeImage = require('./optimizeImage')
const path = require('path')
const { default: imageSize } = require('image-size')


/**
 * Make array of images in src/ markdown docs
 * - Full local paths to images
 * - Confirmed to exist on disk by `fs`
 * - De-duped
 * - Only `publish: true`
 */
async function getPostImages() {

  let allImages = []

  // Demo: https://regex101.com/r/qi8ysh/1/
  const imageRE = /^!\[.*\]\((?<src>[^\s\)]*)[\s|\)]/gm

  // Find all markdown files in src/
  const markdownFiles = await globby("./src/**/*.md")

  for (const md of markdownFiles) {
    let postImages = []
    const { content, data } = matter.read(md)
    // Ignore files without `publish: true`
    if (!data.publish) continue
    // Add frontmatter `image`
    if (data.image) postImages.push(data.image)
    // Find all images in content
    // Demo: https://regex101.com/r/qi8ysh/1
    const foundImages = content.matchAll(imageRE)
    for (const match of foundImages) {
      postImages.push(match.groups.src)
    }
    // Confirm image exists on disk then push to allImages.
    postImages.forEach((src) => {
      const fullPath = path.resolve(path.dirname(md), src)
      if (fs.existsSync(fullPath)) {
        allImages.push(fullPath)
      } else {
        console.warn(`Source image not found: ${fullPath}`.yellow, '- [generateImages.js]')
      }
    })
  }

  // Remove dupes
  // Per: https://stackoverflow.com/a/9229821
  allImages = [...new Set(allImages)]

  // Alphabetize
  allImages.sort()

  // Return array
  return allImages
}



/**
 * Generate optimized versions of images and 
 * output to _site/img directory.
 * Find images in:
 * - src/img/
 * - `publish: true` markdown files (including frontmatter `image`)
 */
(async function() {

  // Create output directory, if it doesn't already exist.
  if (!fs.existsSync('./_site/img')) {
    fs.mkdirSync('./_site/img')
  }

  // Get images
  // Each entry is string with absolute local path
  let images = []
  images.push(...await getPostImages())
  images.push(...await globby("./src/img/**", { absolute: true }))

  // Output optimized versions to _site/img
  for (const sourcePath of images) {
    await optimizeImage(sourcePath)
  }

})()