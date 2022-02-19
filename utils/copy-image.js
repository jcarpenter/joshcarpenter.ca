const fs = require("fs");
const path = require('path');

/**
 * Copy source image to output img directory.
 * @param {string} src - E.g. "/img/ns/home/controls.jpg"
 * @param {number} filename - E.g. "climate.png". Extension will be ignored.
 */
module.exports = function copyImage(src, filename = undefined) {

  // If filename is undefined, else existing from `src`.
  if (!filename) filename = path.basename(src)
  
  const inputPath = path.join(process.cwd(), "src", src)
  const outputPath = path.join(process.cwd(), "_site", path.dirname(src), filename)

  // If image already exists, return
  if (fs.existsSync(outputPath)) return

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
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  // Copy image
  fs.copyFileSync(inputPath, outputPath, fs.constants.COPYFILE_EXCL)
}