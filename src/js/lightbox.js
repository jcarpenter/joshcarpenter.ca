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

  function showLightbox() {
    lightbox.classList.add('show')
  }

  function hideLightbox() {
    lightbox.classList.remove('show')
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

  function setup() {

    let figures = document.querySelectorAll('article > figure')

    if (figures) {

      // For each item, add tabindex, and `lightbox` class.
      figures.forEach(figure => {

        let img = figure.querySelector('img')

        img.setAttribute('tabindex', '0')

        // Make item pointer listeners
        if (window.PointerEvent) {
          img.addEventListener('pointerdown', e => showItem(figure))
        }
      })

      // Make lightbox
      makeLightbox()
    }

    // Make escape key listener
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

  window.addEventListener('DOMContentLoaded', setup)

}(window, document))
