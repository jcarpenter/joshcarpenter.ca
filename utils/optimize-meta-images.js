const fs = require('fs');
const globby = require('globby');
const matter = require('gray-matter');
const path = require('path');
const imageSize = require("image-size");
const sharp = require('sharp');

/**
 * Find and optimize meta images specified in meta_image
 * frontmatter property of markdown and nunjucks templates.
 * Output to _site/img directory. Ignore templates without
 * `publish: true` in frontmatter.
 */
(async function () {

  
  // --------- Get meta_image from post frontmatter --------- //
  
  // Array of meta_images to optimize.
  let meta_images = []
  
  // Find all markdown and nunjucks templates in src/
  // Each array item is absolule local path.
  let posts = []
  posts.push(...await globby("./src/**/*.md"))
  posts.push(...await globby("./src/**/*.njk"))

  // For each template, get the meta_image
  for (const post of posts) {

    // Get frontmatter
    const { data } = matter.read(post)

    // Skip files without `publish: true` or `meta_image`
    if (!data.publish || !data.meta_image) continue

    const inputPath = path.resolve(path.dirname(post), data.meta_image)
    const exists = fs.existsSync(inputPath)

    // Throw error if file does not exists and skip iteration
    if (!exists) {
      console.warn(`Specified meta_image not found: ${data.meta_image}`.yellow, '- [optimize-meta-images.js]')
      continue
    }

    meta_images.push(inputPath)
  }

  // Remove dupes. Per: https://stackoverflow.com/a/9229821
  meta_images = [...new Set(meta_images)]


  // --------- Resize and optimize meta_image and output to _site/img --------- //

  for (const inputPath of meta_images) {

    // Get image details
    const { type, width, height } = imageSize(inputPath)

    // Check image size and format
    const isCorrectSize = width == 1200 && height == 630
    const isOptimized = type == 'jpg'

    const filename = path.parse(inputPath).name + '.jpg'
    const outputPath = path.resolve('_site/img', filename)

    // Output the image. How is dependent on source size and format...
    if (fs.existsSync(outputPath)) {

      // Output already exists. No need to do anything here...

    } else if (isCorrectSize && isOptimized) {

      // Copy jpg unmodified
      fs.copyFileSync(inputPath, outputPath, fs.constants.COPYFILE_EXCL)

    } else if (isCorrectSize && !isOptimized) {

      // Save as JPEG without resizing
      await sharp(inputPath)
        .jpeg({ quality: 90 })
        .toFile(outputPath)

    } else if (!isCorrectSize) {

      // Resize and save as JPEG
      await sharp(inputPath)
        .resize({
          width: 1200,
          height: 630,
          fit: sharp.fit.cover,
          withoutEnlargement: true
        })
        .jpeg({ quality: 90 })
        .toFile(outputPath)
    }
  }
})()
