const colors = require('@colors/colors');
const fs = require("fs");
const path = require("path");
const { optimize: svgo } = require('svgo');

/**
 * Save optimized version of source svg
 * @param {string} src - E.g. "/img/arrow.svg"
 */
 module.exports = function optimizeSvg(src) {

  const inputPath = path.join(process.cwd(), "src", src)
  const outputPath = path.join(process.cwd(), "_site", src)

  // If image already exists, return
  if (fs.existsSync(outputPath)) return

 // Warn if `src` path is relative, or
  // if source file not found
  if (src[0] !== "/") {
    console.warn("Image path is relative:".cyan, src.brightCyan.underline, path.basename(__filename))
    return
  } else if (!fs.existsSync(inputPath)) {
    console.warn("Source SVG not found:".cyan, src.brightCyan.underline, path.basename(__filename))
    return
  }

  // Create path directories if they don't exist
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  // Optimize SVGO
  let file = fs.readFileSync(inputPath, 'utf8')
  const result = svgo(file)
  fs.writeFileSync(outputPath, result.data, (err) => {
    if (err) console.log(err)
  })
}
