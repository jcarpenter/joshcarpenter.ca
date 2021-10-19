/**
 * Create responsive variations of the specified jpeg or png,
 * and add responsive attributes to the img html (or replace
 * it with a picture element)
 */
 function processBitmap($, img, sourcePath, isFirstImage) {

  return new Promise(async function (resolve, reject) {

    // Generate image variations, if they don't already exist
    const variations = await generateImageVariations(sourcePath)

    // What variations do we have to work with? There are 3 scenarios:

    // * 1 variation created. Means the source image's resolution wasn't high
    // enough to create other variations. Very simple! Everything gets this 
    // image, so we don't need to do any responsive image stuff.

    // * 2 variations created. Means the source image was large enough to 
    // create the small and medium variation sizes, but not the largest.
    // Pretty simple: we serve the small to 1x devices, and the medium
    // to 2x devices, using an `img` with `srcset`.

    // * 3 variations created. Means the source image was large enough to
    // create even the largest variation. This is more complicated. We want
    // to serve the small to 1x devices, the medium to 2x and 3x devices 
    // below 440px viewport width, and the large to 2x and 3x devices above
    // 441px viewport width. We use a `picture` element.

    const oneVariation = variations.length == 1
    const twoVariations = variations.length == 2
    const threeVariations = variations.length == 3

    if (oneVariation) {

      // Copy image to destination
      const destinationPath = path.resolve('_site/img', variations[0].filename)
      copyImageToDestination(sourcePath, destinationPath)

      // Update img attributes
      $(img).attr('src', `/img/${variations[0].filename}`)
      $(img).attr('width', variations[0].width)
      $(img).attr('height', variations[0].height)
      $(img).attr('loading', `${isFirstImage ? 'eager' : 'lazy'}`)
      $(img).attr('decoding', 'async')

    } else if (twoVariations) {

      const small = variations[0]
      const medium = variations[variations.length - 1]

      // Update img attributes
      $(img).attr('src', `/img/${medium.filename}`)
      $(img).attr('srcset', `/img/${small.filename} 1x, /img/${medium.filename} 2x`)
      $(img).attr('width', medium.width)
      $(img).attr('height', medium.height)
      $(img).attr('loading', `${isFirstImage ? 'eager' : 'lazy'}`)
      $(img).attr('decoding', 'async')

    } else if (threeVariations) {

      const small = variations[0]
      const medium = variations[1]
      const large = variations[variations.length - 1]

      // Make `picture` element
      let picture = $('<picture></picture>')

      // Make `source` elements
      let sourceSmall = $(`<source srcset="/img/${small.filename}" media="(-webkit-max-device-pixel-ratio: 1)" />`)
      let sourceMedium = $(`<source srcset="/img/${medium.filename}" media="(-webkit-min-device-pixel-ratio: 2) and (max-width: 480px)" />`)
      let sourceLarge = $(`<source srcset="/img/${large.filename}" media="(-webkit-min-device-pixel-ratio: 2) and (min-width: 481px)" />`)

      // Make fallback `img` element.
      let picImg = $(`<img src="/img/${large.filename}" width="${large.width}" heigth="${large.height}" />`)
      if ($(img).attr('alt')) picImg.attr('alt', alt)
      if ($(img).attr('title')) picImg.attr('title', title)
      picImg.attr('loading', `${isFirstImage ? 'eager' : 'lazy'}`)
      picImg.attr('decoding', 'async')

      // Append all to picture
      picture.append(sourceSmall)
      picture.append(sourceMedium)
      picture.append(sourceLarge)
      picture.append(picImg)

      // Replace img with picture
      $(img).replaceWith(picture)
    }

    resolve()
  })
}
