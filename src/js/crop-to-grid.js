// Adapted from https://github.com/matejlatin/Gutenberg/blob/master/src/js/main.js

/*
Some elements do not fit to the grid. If we do not adjust their
heights to fit the grid, every subsequent element will be 
"knocked off" the grid. We find elements we know are problematic,
and increase their heights to the next grid line.
*/
(function (window, document) {
  'use strict'

  // Once DOM has loaded, find lazy-loading images, and setup listeners
  // on them, so we can call resize when the user scrolls and they load.
  // window.addEventListener('load', cropImage)

  // Once whole page has loaded, including assets, 
  // crop loaded images.
  window.addEventListener('load', () => {

    // Get croppable elements on the page
    const croppables = getCroppableElements()

    croppables.forEach((el) => {
      if (el.localName == 'img') {

        // Crop images
        if (el.complete) {
          cropElementToGrid(el)
        } else {
          el.addEventListener('load', (evt) => {
            cropElementToGrid(el)
          })
        }

      } else {

        // Crop other (non-image) croppable elements...
        // E.g. figcaption
        cropElementToGrid(el)

      }
    })
  })

  // When page resizes, re-crop.
  // Debounce to reduce churn.
  // Don't run if page is still loading.
  window.addEventListener('resize', debounce(() => {

    if (document.readyState !== 'complete') return

    // Get croppable elements on the page
    const croppables = getCroppableElements()

    croppables.forEach((el) => {
      // On resize, we don't crop unloaded images. 
      // They'll get cropped when they load (via load listeners we set on them).
      if (el.localName == 'img' && el.complete) {
        cropElementToGrid(el)
      } else {
        cropElementToGrid(el)
      }
    })
  }, 200), true)

}(window, document))


/**
 * Return croppable elements on the page:
 * 1) Replace elements with inherent dimensions, e.g. images.
 * 2) "Mini" typography elements, which use different grid.
 * TODO: We could add a class to elements we want to crop
 * (e.g. ".croppable"), but for now I prefer to define the
 * croppables here, instead of adding classes to HTML. I
 * worry I'll forget what the classes mean. :p
 * @returns NodeList
 */
function getCroppableElements() {
  return document.querySelectorAll(`
    #post #metadata,
    #post #content figure img, 
    #post #content figcaption, 
    #post #notes ol
  `)
}

/**
 * For the specified element... 
 * 1) get original height
 * 2) round height to nearest multiple of the grid
 * 3) set `height` property to new value
 */
function cropElementToGrid(element) {

  // Get grid unit height
  // We use a baseline grid, where line-height = 2 grid units.
  const gridUnitHeight = parseInt(window.getComputedStyle(document.body).getPropertyValue('line-height')) / 2

  // Get original (as currently rendered) height
  // offsetHeight "...returns the height of an element, including vertical padding and borders, as an integer. Typically, offsetHeight is a measurement in pixels of the element's CSS height, including any borders, padding, and horizontal scrollbars (if rendered)." —https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
  const originalHeight = element.offsetHeight

  // Calculate new height
  // If element is image, we want to crop it to fit the grid. Because we can't add vvvv
  // const newHeightInGridUnits = element.localName == 'img' ? 
  //   Math.floor(originalHeight / gridUnitHeight) :
  //   Math.ceil(originalHeight / gridUnitHeight)

  // Calculate new height. Round UP to the next grid line.
  // This will make the new height LARGER than the previous.
  const newHeightInGridUnits = Math.ceil(originalHeight / gridUnitHeight)

  // const newHeightInPx = gridUnitHeight * newHeightInGridUnits

  console.log(element.localName, originalHeight, gridUnitHeight, originalHeight / gridUnitHeight, newHeightInGridUnits)


  // Set new height
  // element.style.height = newHeightInPx + 'px'
  element.style.height = newHeightInGridUnits + 'rem'
}


/**
 * Utility function: debounce running functions.
 * Can't recall where I found this, but it's not mine.
 */
function debounce(func, wait, immediate) {
  let timeout
  return function () {
    const context = this
    const later = function () {
      timeout = null
      if (!immediate) func.apply(context)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context)
  }
}