// Adapted from https://github.com/matejlatin/Gutenberg/blob/master/src/js/main.js

/*
If I fit images to a max height, this is easy. 
If I let images go full width, I will need to fit the heights.
*/

(function (window, document) {
  'use strict'

  let images

  // Get all images This only runs once, which cause problems if we add or remove images dynamically.
  function getImages() {
    return document.querySelectorAll('article figure img')
  }

  function fixImgHeight() {

    // Get all images
    if (images == null) images = getImages()

    // Get line-height
    let style = window.getComputedStyle(document.body)
    let lineHeight = parseInt(style.getPropertyValue('line-height')) / 2
    // console.log(lineHeight)

    // For each image in images:
    // 1) get original height
    // 2) round height to nearest multiple of half baseline grid (13px)
    // 3) set height to new value

    for (let i = 0; i < images.length; ++i) {

      //Reset height so we can get pixel value
      // images[i].style.width = '100%'
      // images[i].style.height = 'auto'

      // Get original height
      // offsetHeight "...returns the height of an element, including vertical padding and borders, as an integer. Typically, offsetHeight is a measurement in pixels of the element's CSS height, including any borders, padding, and horizontal scrollbars (if rendered)." —https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
      let imgOriginalHeight = images[i].offsetHeight

      // Calculate new height
      let imgRatio = Math.floor(imgOriginalHeight / lineHeight)
      let imgNewHeight = lineHeight * imgRatio

      // Set new dimensions
      // images[i].style.width = images[i].offsetWidth + 'px'
      images[i].style.height = imgNewHeight + 'px'

      // console.log(lineHeight, imgOriginalHeight, imgRatio, imgNewHeight)
    }
  }

  //Fix once on first page load
  window.addEventListener('load', fixImgHeight)

  //Make sure that we fix images on each window resize (add debounce for performance)
  window.addEventListener('resize', debounce(fixImgHeight, 100), true)

  //helper: debounce
  function debounce(func, wait, immediate) {
    let timeout
    return function () {
      let context = this, args = arguments
      let later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      let callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  }

}(window, document))
