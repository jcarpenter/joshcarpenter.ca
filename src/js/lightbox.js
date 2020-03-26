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

  let lightbox, image, caption


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
        img.addEventListener('pointerup', e => openInLightbox(figure))
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

    image = document.createElement('div')
    image.id = 'image'

    caption = document.createElement('div')
    caption.id = 'caption'

    let background = document.createElement('div')
    background.id = 'background'

    let close = document.createElement('img')
    close.setAttribute('src', '../img/close.svg')
    close.setAttribute('alt', 'Close image')
    close.id = "close"

    if (window.PointerEvent) {
      close.addEventListener('pointerup', hideLightbox)
      background.addEventListener('pointerdown', hideLightbox)
    }

    lightbox.appendChild(image)
    lightbox.appendChild(caption)
    lightbox.appendChild(close)
    lightbox.appendChild(background)

    document.body.appendChild(lightbox)
  }

  // -------- Open and closing functions -------- //

  function showLightbox() {
    lightbox.classList.add('show')

    // Stop scrolling while lightbox is open
    // Adapted from: https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
    const scrollY = window.scrollY
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;
  }

  function hideLightbox() {

    lightbox.classList.remove('show')

    removeContents()

    // Reactivate scrolling when the lightbox is reopened
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }

  function removeContents() {

    image.removeChild(image.querySelector('img'))
    caption.innerHTML = ""
  }

  function openInLightbox(el) {

    showLightbox()

    let img = el.querySelector('img').cloneNode(true)
    let cap = el.querySelector('figcaption').innerHTML

    if (img) {
      img.setAttribute('sizes', '100vw')
      img.removeAttribute('style')
    }

    image.appendChild(img)
    caption.innerHTML = cap

    let note = caption.querySelector('.note')
    if (note) {
      note.classList.remove('below')
      note.classList.add('above')
    }
  }

  // -------- Setup once DOM is loaded -------- //

  window.addEventListener('DOMContentLoaded', checkPreconditions)

}(window, document))
