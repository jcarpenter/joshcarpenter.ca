const colors = require('colors');
const fs = require('fs');
const globby = require('globby');
const matter = require('gray-matter');
const optimizeBodyImage = require('./optimize-body-image');
const path = require('path');

// Find images in implicit figures format in markdown files
// Demo: https://regex101.com/r/qi8ysh/1/
const imageInMarkdownImplicitFigureRE = /^!\[.*\]\((?<src>[^\s\)]*)[\s|\)]/gm

// Find images in HTML. With `src` group.
// Demo: https://regex101.com/r/8EhoSo/1
const imageInHtmlRE = /<img\s[^>]*?src\s*=\s*['\"](?<src>[^'\"]*?)['\"][^>]*?>/gm

// Find videos in HTML. With `poster` group.
// Demo: https://regex101.com/r/fq8uke/1
// const videoInHtmlRE = /<video\s[^>]*?poster\s*=\s*['\"](?<poster>[^'\"]*?)['\"][^>]*?>/gm

/**
 * Return array of images in #body of markdown and nunjuck templates:
 * - Markdown: Find images inside figures
 * - Nunjucks: Find images inside img and video posters.
 * Ignore templates without `publish: true` in frontmatter.
 * Get full local paths to images. And de-dupe.
 * Warn on images that aren't found on disk.
 */
async function getBodyImages() {

  // Array of posts. Each is path to post.
  let posts = []
  let allImages = []

  // Find all markdown files in src/
  posts.push(...await globby("./src/**/*.md"))
  
  // Find all Nunjuck files in /src/portfolio and /src/projects
  posts.push(...await globby(["./src/portfolio/**/*.njk", "./src/projects/**/*.njk"]))

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
      // Find in figures
      for (const match of content.matchAll(imageInMarkdownImplicitFigureRE)) {
        postImages.push(match.groups.src)
      }
    } else if (path.extname(post) == '.njk') {
      // Nunjucks posts...
      const content = fs.readFileSync(post, 'utf-8')
      // Find in img `src`
      for (const match of content.matchAll(imageInHtmlRE)) {
        postImages.push(match.groups.src)
      }
    }

    // For each image, confirm that it exists on disk.
    // If yes, then push to `allImages`. Else, warn.
    postImages.forEach((src) => {
      const fullPath = path.resolve(path.dirname(post), src)
      if (fs.existsSync(fullPath)) {
        allImages.push(fullPath)
      } else {
        console.warn(`Source image not found: ${fullPath}`.yellow, '- [optimize-body-images.js]')
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
 * Output optimized versions of images in the #body of 
 * markdown and nunjucks templates. These are our "posts", 
 * and the #body is the copy. Ignore templates without
 * `publish: true` in frontmatter.
 */
 (async function() {

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
