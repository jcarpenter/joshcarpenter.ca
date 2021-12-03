const colors = require('colors')
const fs = require('fs')
const globby = require('globby')
const matter = require('gray-matter')
const optimizeImage = require('./optimizeImage')
const path = require('path')
const { default: imageSize } = require('image-size')

// Find images in implicit figures format in markdown files
// Demo: https://regex101.com/r/qi8ysh/1/
const imageInMarkdownImplicitFigureRE = /^!\[.*\]\((?<src>[^\s\)]*)[\s|\)]/gm

// Find images in html
// Demo: https://regex101.com/r/OA1DgE/1
const imageInHtmlRE = /<img\s[^>]*?src\s*=\s*['\"](?<src>[^'\"]*?)['\"][^>]*?>/gm

/**
 * Make array of images in src/ markdown docs
 * - Full local paths to images
 * - Confirmed to exist on disk by `fs`
 * - De-duped
 * - Only `publish: true`
 */
async function getPostImages() {

  // Array of posts. Each is path to post.
  let posts = []
  let allImages = []

  // Find all markdown files in src/
  posts.push(...await globby("./src/**/*.md"))
  
  // Find all Nunjuck files in src/
  posts.push(...await globby("./src/**/*.njk"))

  // For each post, find the images and push to `allImages`
  for (const post of posts) {

    // Get frontmatter
    const { data } = matter.read(post)
    
    // Skip files without `publish: true` in front matter
    if (!data.publish) continue
    
    // Array of all images in the post
    // Each is a path to the image taken from `src` attribute
    let postImages = []
    
    // Find images in post and push to `postImages`
    if (path.extname(post) == '.md') {
      // Markdown posts...
      const { content } = matter.read(post)
      for (const match of content.matchAll(imageInMarkdownImplicitFigureRE)) {
        postImages.push(match.groups.src)
      }
    } else if (path.extname(post) == '.njk') {
      // Nunjucks posts...
      const content = fs.readFileSync(post, 'utf-8')
      for (const match of content.matchAll(imageInHtmlRE)) {
        postImages.push(match.groups.src)
      }
    }

    // Also get image in frontmatter `image` field (if present)
    if (data.image) postImages.push(data.image)

    // For each image, confirm that it exists on disk.
    // If yes, then push to `allImages`. Else, warn.
    postImages.forEach((src) => {
      const fullPath = path.resolve(path.dirname(post), src)
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

  // Array of images to optimize.
  // Each entry is string with absolute local path
  let images = []
  // Get images from posts
  images.push(...await getPostImages())
  // Get images from src/img directory
  images.push(...await globby("./src/img/**", { absolute: true }))

  // Output optimized versions to _site/img
  for (const sourcePath of images) {
    await optimizeImage(sourcePath)
  }

})()