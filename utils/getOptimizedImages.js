const fs = require('fs')
const imageSize = require("image-size")
const path = require('path')

let images = []

/**
 * Return array of optimized images.
 * Each entry has 
 * @returns 
 */
module.exports = function () {

  // If images is already populated, return it
  if (images.length) return images

  fs.readdirSync('_site/img').forEach((img) => {
    const imgPath = path.resolve('_site/img', img)
    const { type, width, height } = imageSize(imgPath)
    images.push({
      // img/browser.jpg
      path: imgPath,
      // browser.jpg
      base: path.basename(img),
      // browser
      name: path.parse(img).name,
      // .jpg
      ext: path.parse(img).ext,
      // jpg
      type,
      width,
      height
    })
  })

  // console.log(images)

  return images
}