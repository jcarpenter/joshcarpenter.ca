const config = require('../config').responsive_images
const globby = require('globby')
const sharp = require('sharp')

/**
 * Generate compressed versions of original images in range of sizes, for use in responsive images.
 * - Do not upscale images. Downscale only. If the original size is 1100px, we will not scale it up to 1440px (that would degrade quality). We -will- downscale it to 900px and 600px versions. And we will create a "large" version, unscaled, at 1100px, if that's not too close to the next lowest-resolution (see next point).
 * - Do not generate images if they will be the same (or only marginally higher) resolution as the next step down. If the original image was 700px, we will create "small" (600px, downscaled), and "medium" (700px, unscaled) versions, but not a "large" version. Otherwise that large version would be identical (700px) to the medium version.
 */
async function resize() {

  const images = globby.sync(`src/**/*.{jpg,png}`)

  images.map(async (img) => {

    const original = await sharp(img).metadata()
    const sizesToGenerate = []

    // Always create smallest size
    sizesToGenerate.push(config.sizes[0])

    // Only create larger versions if they are larger (plus padding) than the next-lowest resolution size.
    for (let i = 1; i < config.sizes.length; i++) {
      let size = config.sizes[i]
      let nextSizeDown = config.sizes[i - 1]
      if (original.width > nextSizeDown.width + config.padding) {
        sizesToGenerate.push(size)
      }
    }

    // Generate sizes, in parallel
    sizesToGenerate.map(async (size) => {

      // Before:  src/img/posts/ocean.png
      // After: _site/img/ocean-600px.jpg
      let output = '_site/img/' + img.substring(img.lastIndexOf('/') + 1).slice(0, -4).concat(`${size.suffix}.jpg`)

      await sharp(img)
        .resize({
          width: size.width,
          withoutEnlargement: true,
        })
        .removeAlpha()
        .toFormat(config.format, {
          quality: config.quality
        })
        .toFile(output)

    })
  })
}

resize()