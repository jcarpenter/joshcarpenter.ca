const cheerio = require('cheerio')
const config = require('../config')
const updateImages = require('./update_images.js')
const prepFiguresForLightbox = require('./prep_figures_for_lightbox.js')
const prepFiguresForA11y = require('./prep_figures_for_a11y.js')
const createFootnotesAndReferencedWorks = require('./create_foonotes_and_referenced_works.js')
const fse = require('fs-extra')
const globby = require('globby')


/**
 * Add hanging-punctuation class to <p> starting with `"`
 * Check if first character of paragraph is a quotation mark. If yes, add class.\
 * TODO: Add this to blockquotes too?
 */
function addHangingPunctuation(content) {
  return content.replace(/(<p>“)/gm, '<p class="hanging-punctuation">“')
}

async function postProcess() {

  const allHtmlFiles = globby.sync('_site/**/*.html')
  const allImageFiles = globby.sync('_site/img/*.{jpg,png}')

  allHtmlFiles.map(async (path) => {
    let file = await fse.readFile(path, 'utf8')

    // Update
    file = addHangingPunctuation(file)
    file = prepFiguresForLightbox(file)
    file = prepFiguresForA11y(file)
    file = updateImages(file, allImageFiles)
    file = createFootnotesAndReferencedWorks(file)

    // Write
    await fse.writeFile(path, file)
  })
}

postProcess()