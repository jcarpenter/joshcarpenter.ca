const colors = require('colors')
const createFootnotesAndReferencedWorks = require('./create_foonotes_and_referenced_works.js')
const fse = require('fs-extra')
const globby = require('globby')
const prepFiguresForA11y = require('./prep_figures_for_a11y.js')
const prepFiguresForLightbox = require('./prep_figures_for_lightbox.js')
const updateImages = require('./update_images.js')
const updateMetaTags = require('./update_meta_tags.js')


/**
 * Add hanging-punctuation class to <p> starting with `"`
 * Check if first character of paragraph is a quotation mark. If yes, add class.\
 * TODO: Add this to blockquotes too?
 */
function addHangingPunctuation(content) {
  return content.replace(/(<p>“)/gm, '<p class="hanging-punctuation">“')
}

/**
 * Apply various transforms to the HTML files output from elevent.
 * E.g. Adding accessibility attributes, and updating image paths.
 */
async function postProcess() {

  const allHtmlFiles = globby.sync('_site/**/*.html')

  allHtmlFiles.map(async (path) => {

    // console.log(path.black.bgGreen)
    let file = await fse.readFile(path, 'utf8')

    // Update
    file = addHangingPunctuation(file)
    file = prepFiguresForLightbox(file)
    file = prepFiguresForA11y(file)
    file = updateImages(file)
    file = await updateMetaTags(file)
    file = createFootnotesAndReferencedWorks(file)

    // Write
    await fse.writeFile(path, file)
  })
}

postProcess()