const cheerio = require('cheerio')
const colors = require('colors')
const fse = require('fs-extra')
const globby = require('globby')

const foonotesAndReferences = require('./modify-html/footnotes-and-references.js')
const figures = require('./modify-html/figures.js')
const lightbox = require('./modify-html/lightbox.js')
const metatags = require('./modify-html/meta-tags.js')


/**
 * Add hanging-punctuation class to <p> starting with `"`
 * Check if first character of paragraph is a quotation mark. If yes, add class.\
 * TODO: Add this to blockquotes too?
 */
function hangingPunctuation(content) {
  return content.replace(/(<p>“)/gm, '<p class="hanging-punctuation">“')
}

/**
 * Apply various transforms to the HTML files output from elevent.
 * E.g. Adding accessibility attributes, and updating image paths.
 */
async function modifyHTML() {

  const allHtmlFiles = globby.sync('_site/**/*.html')

  // console.log(`Post processing ${allHtmlFiles.length} html files...`.bgGreen.black)

  const writtenFiles = []

  await Promise.all(
    allHtmlFiles.map(async (path) => {

      let file = await fse.readFile(path, 'utf8')

      // ---- Updates ----//

      // Fix image paths in meta tags
      // file = await metatags(file, path)

      // Add hanging-punctuation class to <p> starting with `"`
      file = hangingPunctuation(file)

      // Add a11y features to figures
      // file = figures(file)

      // Generate footnotes when we find marks (==)
      // file = foonotesAndReferences(file, path)

      // Append lightbox.js script if there are elements that meet the criteria
      // file = lightbox(file)

      // Write changes
      await fse.writeFile(path, file)
      writtenFiles.push(path)
    })
  )

  writtenFiles.map((path) => {
    // console.log(`Writing ${path}`.green)
  })
}

modifyHTML()