/*
TODO: 
* Make only article images responsive
* Process images
* Arrows cycle through images
* Remove cloned item after fade out
* Test on mobile
* Style layout of cloned items (eg centered, full width, captions, etc)
* Consider switching to markdown-it-responsive
*/

(function (window, document) {
  'use strict'

  let lightbox
  let itemHolder


  // -------- Check viewport size -------- //

  // We only want lightbox to work on tablet and desktop-sized devices.
  // We check the viewport size using matchMedia API. 
  // Docs: https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia

  function isViewportLargeEnough() {

    // Check for matchMedia API support. If it doesn't exist, return true.
    // Support for matchMedia is very good: https://caniuse.com/#feat=matchmedia
    if (!matchMedia) return false

    // Check if the document matches min-width and height. 
    // This returns a MediaQueryList object.
    // We only want lightbox for desktop and tablets (larger screens). We combine min-width and min-height to ensure that phones in landscape are also filtered out (and not just phones in portrait).
    let mq = window.matchMedia("screen and (min-width: 680px) and (min-height: 480px)")

    // The `matches` property of the MediaQueryList tells us if the document meets the media query's requirements.
    // If it matches, set up the lightbox.
    if (mq.matches) return true
  }

  function getFigures() {
    let figures = document.querySelectorAll('article > figure')
    return figures
  }


  // -------- Check that preconditions are true -------- //

  // We only need to setup lightbox is:
  // 1) viewport is large enough, and
  // 2) if there are figures

  function checkPreconditions() {

    let largeEnough = isViewportLargeEnough()
    let figures = getFigures()

    if (largeEnough && figures) {

      addInteractions(figures)
      makeLightbox()
      console.log("Make lightbox!!!")

    } else {

      console.log("NOPE: Lightbox not needed.")

    }
  }


  // -------- Add interactions -------- //

  function addInteractions(figures) {

    figures.forEach(figure => {

      const img = figure.querySelector('img')
      
      // Set cursor to pointer
      img.setAttribute('style', 'cursor: pointer')

      // Add tab index atttribute
      img.setAttribute('tabindex', '0')

      // Add pointer listeners
      if (window.PointerEvent) {
        img.addEventListener('pointerup', e => showItem(figure))
      }
    })

    // Add escape key listener (hides lightbox)
    document.addEventListener('keyup', function (event) {

      if (event.defaultPrevented) {
        return
      }

      var key = event.key || event.keyCode

      if (key === 'Escape' || key === 'Esc' || key === 27) {
        hideLightbox()
      }
    })
  }


  // -------- Make lightbox elements -------- //

  function makeLightbox() {

    lightbox = document.createElement('div')
    lightbox.id = 'lightbox'

    itemHolder = document.createElement('div')
    itemHolder.id = 'itemHolder'

    let background = document.createElement('div')
    background.id = 'background'

    let close = document.createElement('img')
    close.setAttribute('src', '../img/close.svg')
    close.setAttribute('alt', 'Close image')
    close.id = "close"

    if (window.PointerEvent) {
      close.addEventListener('pointerdown', hideLightbox)
      background.addEventListener('pointerdown', hideLightbox)
    }

    lightbox.appendChild(itemHolder)
    lightbox.appendChild(close)
    lightbox.appendChild(background)
    document.body.appendChild(lightbox)
  }


  // -------- Open and closing functions -------- //

  function showLightbox() {
    lightbox.classList.add('show')
  }

  function hideLightbox() {
    lightbox.classList.remove('show')
    removePrevItem()
  }

  function removePrevItem() {
    let child = itemHolder.lastElementChild
    while (child) {
      itemHolder.removeChild(child)
      child = itemHolder.lastElementChild
    }
  }

  function showItem(item) {

    removePrevItem()
    showLightbox()

    let clone = item.cloneNode(true)
    clone.classList.add('item')

    let img = clone.querySelector('img')
    if (img) {
      img.setAttribute('sizes', '100vw')
      img.removeAttribute('style')
    }
    itemHolder.appendChild(clone)
  }


  // -------- Setup once DOM is loaded -------- //

  window.addEventListener('DOMContentLoaded', checkPreconditions)

}(window, document))
