const colors = require('colors')
const fs = require('fs');
const matter = require('gray-matter');
const path = require('path');
const imageSize = require("image-size");
const sharp = require('sharp');
const getOptimizedImages = require('./getOptimizedImages');

/**
 * Find and optimize meta images specified in meta_image
 * frontmatter property of markdown and nunjucks templates.
 * Output to _site/img directory. Ignore templates without
 * `publish: true` in frontmatter.
 */
(async function () {

  const { globby } = await import('globby')


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

    // Skip files without `publish: true`
    if (!data.publish) continue

    // Warn and skip if meta_image is not defined
    if (!data.meta_image) {
      console.warn('optimize-meta-images.js -', 'meta_image not defined in'.green, `${path.basename(post)}`.brightGreen.underline)
      continue
    }

    const metaImage = path.resolve(path.dirname(post), data.meta_image)
    const exists = fs.existsSync(metaImage)

    // Throw error if file does not exists and skip iteration
    if (!exists) {
      console.warn('optimize-meta-images.js -', 'Cannot find on disk:'.green, `${path.basename(post)}`.brightGreen.underline)
      continue
    }

    meta_images.push(metaImage)
  }

  // Remove dupes. Per: https://stackoverflow.com/a/9229821
  meta_images = [...new Set(meta_images)]

  // Get the already-optimized images from `_site/img`
  const optimizedImages = getOptimizedImages();


  // --------- Resize and optimize meta_image and output to _site/img --------- //

  for (const inputPath of meta_images) {

    // If the image has already been optimized, skip
    const isAlreadyOptimized = optimizedImages.some((img) => {
      img.name.includes(path.parse(inputPath).name)
    })
    if (isAlreadyOptimized) continue

    const filename = path.parse(inputPath).name + '.jpg'
    const outputPath = path.resolve('_site/img', filename)

    // Get image details
    const { type, width, height } = imageSize(inputPath)

    // Check image size and format
    const isCorrectSize = width == 1200 && height == 630
    const isJpg = type == 'jpg'

    // Output the image. How is dependent on source size and format...
    if (fs.existsSync(outputPath)) {

      // Output already exists. No need to do anything here...

    } else if (isCorrectSize && isJpg) {

      // Copy jpg unmodified
      fs.copyFileSync(inputPath, outputPath, fs.constants.COPYFILE_EXCL)

    } else {

      // Save as JPEG. Resize if not correct size.

      // Create a sharp instance
      const sharpStream = sharp(inputPath)

      if (!isCorrectSize) {
        sharpStream.resize({
          width: 1200,
          height: 630,
          fit: sharp.fit.cover,
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
          fastShrinkOnLoad: true
        })
      }

      // Create webp and jpeg versions of the source image
      sharpStream.jpeg({ quality: 90, mozjpeg: true }).toFile(outputPath)
    }
  }
})()
