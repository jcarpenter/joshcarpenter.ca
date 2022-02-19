const colors = require('colors');
const fs = require('fs');
const matter = require('gray-matter');
const optimizeBodyImage = require('./optimize-body-image');
const path = require('path');

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
 * Return array of images in `#body` of markdown and nunjuck templates.
 * Ignore templates without `publish: true` in frontmatter.
 * Get full local paths to images. And de-dupe.
 * Warn on images that aren't found on disk.
 */
async function getBodyImages() {

  const { globby } = await import('globby')

  // Array of posts. Each is path to post.
  let posts = []
  let allImages = []

  // Find all markdown files in src/
  posts.push(...await globby("./src/**/*.md"))

  // Find all Nunjuck files in /src/portfolio and /src/projects
  posts.push(...await globby(["./src/home.njk", "./src/portfolio/**/*.njk", "./src/projects/**/*.njk"]))

  // For each post, find the images and push to `allImages`
  for (const post of posts) {

    // Get content and frontmatter
    const { content, data } = matter.read(post)

    // Skip files without `publish: true` in front matter
    if (!data.publish) continue

    // Array of all images in the post
    // Each is a path to the image taken from `src` attribute
    let postImages = []

    
    // Get images from content
    for (const img of content.matchAll(imagePathRE)) {
      postImages.push(img[0])
    }

    // Get `meta_image` from frontmatter
    // Warn if it is not defined
    if (!data.meta_image) {
      console.warn('optimize-body-images.js - ', `meta_image not defined:`.green, `${path.basename(post)}`.brightGreen)
    } else {
      const metaImage = path.resolve(path.dirname(post), data.meta_image)
      postImages.push(metaImage)
    }

    // For each image, confirm that it exists on disk.
    // If yes, then push to `allImages`. Else, warn.
    postImages.forEach((src) => {
      const fullPath = path.resolve(path.dirname(post), src)
      if (fs.existsSync(fullPath)) {
        allImages.push(fullPath)
      } else {
        console.warn('optimize-body-images.js - ', `Source image not found:`.green, `${fullPath}`.brightGreen.underline)
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
  images.push(...await getBodyImages())
  // Get images from src/img directory
  // images.push(...await globby("./src/img/**", { absolute: true }))

  // Output optimized versions to _site/img
  for (const sourcePath of images) {
    await optimizeBodyImage(sourcePath)
  }

})()
