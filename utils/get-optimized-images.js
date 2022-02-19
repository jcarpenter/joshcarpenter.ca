const fs = require('fs')
const imageSize = require("image-size")
const path = require('path')

let images = []

/**
 * Return array of optimized images.
 */
module.exports = function () {

  // // If images is already populated, return it
  // if (images.length) return images

  let files = fs.readdirSync('_site/img')
  
  // Filter hidden files
  files = files.filter((file) => !(/(^|\/)\.[^\/\.]/g).test(file))

  files.forEach((file) => {
    const imgPath = path.resolve('_site/img', file)
    const { type, width, height } = imageSize(imgPath)
    images.push({
      path: imgPath, // img/browser.jpg
      base: path.basename(file), // browser.jpg
      name: path.parse(file).name, // browser
      ext: path.parse(file).ext, // .jpg
      type,
      width,
      height
    })
  })

  return images
}