const fs = require("fs");
const path = require('path');
const sharp = require('sharp');

/**
 * Optimize the specified image as WebP and/or JPEG
 * @param {string} src - E.g. "/img/sailboat.png"
 * @param {boolean} compressWebP - If true, save WebP version
 * @param {boolean} compressJpeg - If true, save JPEG version
 * @param {number} resizeTo - Optional. Specify new width.
 * @param {number} filename - E.g. "climate.png". Extension will be ignored.
 * @returns 
 */
module.exports = async function optimizeBitmap(src, compressWebP = true, compressJpeg = true, resizeWidth = undefined, resizeHeight = undefined, filename = undefined) {

  // If filename is undefined, else existing from `src`.
  if (!filename) filename = path.basename(src)
  
  const inputPath = path.join(process.cwd(), "src", src)
  const outputPathWebp = path.join(process.cwd(), "_site", path.dirname(src), path.parse(filename).name + ".webp")
  const outputPathJpg = path.join(process.cwd(), "_site", path.dirname(src), path.parse(filename).name + ".jpg")

  // Warn if `src` path is relative, or
  // if source file not found
  if (src[0] !== "/") {
    console.warn("Image path is relative:".cyan, src.brightCyan.underline, path.basename(__filename))
    return
  } else if (!fs.existsSync(inputPath)) {
    console.warn("Source image not found:".cyan, src.brightCyan.underline, path.basename(__filename))
    return
  }

  // Make sure output directory exists
  const outputDir = path.dirname(outputPathJpg)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  // Create a sharp instance
  const sharpStream = sharp(inputPath)

  // Resize, if specified. Aspect ratio will be maintained.
  if (resizeWidth || resizeHeight) {
    sharpStream.resize({
      width: resizeWidth,
      height: resizeHeight,
      fit: "cover",
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
      fastShrinkOnLoad: true
    })
  }

  const promises = []

  // Compress
  if (compressWebP) {
    promises.push(sharpStream.clone().webp({ quality: 85 }).toFile(outputPathWebp))
  }

  if (compressJpeg) {
    promises.push(sharpStream.clone().jpeg({ quality: 90, mozjpeg: true }).toFile(outputPathJpg))
  }

  // Process
  await Promise.all(promises)
}