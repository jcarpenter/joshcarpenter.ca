(function(window, document) {
  'use strict'

  let article
  let lightbox
  let prev
  let next
  const items = []
  let indexOfActiveItem = null
  let isOpen = false


  // -------- Precondition: Is viewport large enough? -------- //

  /**
   * We only want lightbox to work on tablet and desktop-sized devices.
   * We check the viewport size using matchMedia API.
   * Docs: https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
   */
  function isViewportLargeEnough() {
    // Check for matchMedia API support. If it doesn't exist, return true.
    // Support for matchMedia is very good: https://caniuse.com/#feat=matchmedia
    if (!matchMedia) return false

    // Check if the document matches min-width and height.
    // This returns a MediaQueryList object.
    // We only want lightbox for desktop and tablets (larger screens). We combine min-width and min-height to ensure that phones in landscape are also filtered out (and not just phones in portrait).
    const mq = window.matchMedia('screen and (min-width: 680px) and (min-height: 480px)')

    // The `matches` property of the MediaQueryList tells us if the document meets the media query's requirements.
    // If it matches, set up the lightbox.
    if (mq.matches) return true
  }


  // -------- Call setup functions if preconditions are true -------- //

  /**
   * We only setup lightbox if:
   * 1) viewport is large enough, and 2) there are figures
   */
  function checkPreconditions() {
    article = document.querySelector('article')

    // Is viewport is large enough?
    const islargeEnough = isViewportLargeEnough()
    if (!islargeEnough) return

    // Is there valid content?
    const figures = article.querySelectorAll('figure')
    if (!figures) return

    // Store content id's in `items` array
    figures.forEach((node) => {
      items.push(node.id)
    })

    makeLightbox()
    prepThumbs()
    addKeyboardControls()

    // Only add prev/next controls if there are multiple items
    if (items.length > 1) {
      addPrevNextControls()
    }

    checkUrlHash()
  }


  // -------- Make lightbox elements -------- //

  function makeLightbox() {
    lightbox = document.createElement('div')
    lightbox.id = 'lightbox'

    // media = document.createElement('div')
    // media.id = 'media'

    // caption = document.createElement('div')
    // caption.id = 'caption'

    const close = document.createElement('img')
    close.setAttribute('src', '/img/close.svg')
    close.setAttribute('alt', 'Close')
    close.id = 'close'

    const background = document.createElement('div')
    background.id = 'background'

    if (window.PointerEvent) {
      close.addEventListener('pointerup', closeLightbox)
      background.addEventListener('pointerup', closeLightbox)
    }

    // lightbox.appendChild(media)
    // lightbox.appendChild(caption)
    lightbox.appendChild(close)
    lightbox.appendChild(background)

    document.body.appendChild(lightbox)
  }


  // -------- Prep thumbnails -------- //

  function prepThumbs() {
    const figures = document.querySelectorAll('article > figure')

    figures.forEach((figure) => {
      const thumb = figure.querySelector('img')
      const id = figure.id

      // Set cursor to pointer
      thumb.setAttribute('style', 'cursor: pointer')

      // Add tab index atttribute
      thumb.setAttribute('tabindex', '0')

      if (window.PointerEvent) {
        thumb.addEventListener('pointerup', (e) => {
          loadItem(id)
        })
      }
    })
  }


  // -------- Add keyboard interactions -------- //

  /**
   * Add keyboard controls
   */
  function addKeyboardControls() {
    // Add escape key listener (hides lightbox)
    document.addEventListener('keyup', (e) => {
      if (e.defaultPrevented) return

      const key = e.key || e.keyCode

      if (key === 'Escape' || key === 'Esc' || key === 27) {
        if (isOpen) closeLightbox()
      } else if (key === 'ArrowLeft' || key === 37) {
        if (items.length > 1) {
          if (isOpen) prevItem()
        }
      } else if (key === 'ArrowRight' || key === 39) {
        if (items.length > 1) {
          if (isOpen) nextItem()
        }
      }
    })
  }

  /**
   * Add prev/next controls
   */
  function addPrevNextControls() {
    // Make elements
    prev = document.createElement('img')
    prev.setAttribute('src', '/img/arrow.svg')
    prev.setAttribute('alt', 'Previous')
    prev.id = 'prev'

    next = document.createElement('img')
    next.setAttribute('src', '/img/arrow.svg')
    next.setAttribute('alt', 'Next')
    next.id = 'next'

    if (window.PointerEvent) {
      prev.addEventListener('pointerup', prevItem)
      next.addEventListener('pointerup', nextItem)
    }

    lightbox.appendChild(prev)
    lightbox.appendChild(next)

    // let leftSideOfImage = document.createElement('div')
    // leftSideOfImage.id = 'leftSideOfImage'
    // media.appendChild(leftSideOfImage)
  }


  // -------- Check URL -------- //

  /**
   * Check search params and open lightbox if
   */
  function checkUrlHash() {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)

    // Check for `view` param
    if (params.has('view')) {
      // Check if `view` param is in `items` array
      const paramId = params.get('view')

      if (items.includes(paramId)) {
        // Load item specified in paramId
        loadItem(paramId)
      }
    }
  }


  // -------- Load -------- //

  function loadItem(id) {
    // Get element to clone
    const element = article.querySelector(`#${id}`)
    const img = element.querySelector('img').cloneNode(true)
    const cap = element.querySelector('figcaption').innerHTML

    const holder = document.createElement('div')
    const media = document.createElement('div')
    const caption = document.createElement('div')

    holder.classList.add('holder')
    media.classList.add('media')
    caption.classList.add('caption')

    holder.appendChild(media)
    holder.appendChild(caption)
    lightbox.appendChild(holder)

    // Set up
    holder.ontransitionend = () => {
      if (!holder.classList.contains('open')) {
        lightbox.removeChild(holder)
      }
    }
    // If media is an image, remove responsive sizes and styles.
    // 1) We don't need these, and 2) they interfer with layout if left in.
    if (img) {
      img.setAttribute('sizes', '100vw')
      img.removeAttribute('style')
    }

    // Populate lightbox
    media.appendChild(img)
    caption.innerHTML = cap

    // Update URL
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.set('view', id)
    url.search = params.toString()
    window.history.pushState('', '', url.toString())

    // Update `indexOfActiveItem` with the index of the id in the `items` array
    // We use it in prev/next functions to determine if we're at start or finish.
    indexOfActiveItem = items.findIndex((item) => item === id)

    // Update prev/next controls
    // Disable prev or next if we're on first or last image
    if (items.length > 1) {
      if (indexOfActiveItem === 0) {
        prev.classList.add('disabled')
        next.classList.remove('disabled')
      } else if (indexOfActiveItem === items.length - 1) {
        prev.classList.remove('disabled')
        next.classList.add('disabled')
      } else {
        prev.classList.remove('disabled')
        next.classList.remove('disabled')
      }
    }

    // If caption contains a note, update the note style to make the note popup render above, instead of below (the default). The default would make it render mostly offscreen, because lightbox captions are placed at the bottom of the viewport.
    const note = caption.querySelector('.note')
    if (note) {
      note.classList.remove('below')
      note.classList.add('above')
    }

    // Show lightbox, if it's not already visible
    if (!lightbox.classList.contains('open')) {
      openLightbox()
    }

    // Reveal new item by adding `open` class
    // We have to delay adding the class a few ms after appendChild(), or the initial values will not be set, and the element will appear in its final state. Per: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions#JavaScript_examples
    window.setTimeout(() => {
      holder.classList.add('open')
    }, 5)
  }


  // -------- Show / Close -------- //

  function openLightbox() {
    isOpen = true
    lightbox.classList.add('open')

    // Stop scrolling while lightbox is open
    // Adapted from: https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.top = `-${scrollY}px`
  }

  function closeLightbox() {
    // Hide
    lightbox.classList.remove('open')

    emptyLightbox()

    // Update URL (clear hash)
    // Per: https://stackoverflow.com/a/2295951
    window.history.pushState('', '', window.location.pathname)

    // Null active item
    indexOfActiveItem = null

    // Reactivate scrolling
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.top = ''
    window.scrollTo(0, parseInt(scrollY || '0') * -1)

    isOpen = false
  }

  function emptyLightbox() {
    // After fade out is complete, remove any instances of holder class
    const holders = lightbox.querySelectorAll('.holder')

    holders.forEach((holder) => {
      lightbox.removeChild(holder)
    })
  }


  // -------- Prev & Next -------- //

  /**
   * Remove the `open` class from the outgoing holder
   * This will trigger the opacity transition.
   * On transition complete, the ontransitionend event listener for the element (which we setup in loadItem) will trigger, and remove the holder from the lightbox.
  */
  function hideOutgoingItem() {
    const holders = lightbox.querySelectorAll('.holder.open')
    if (holders) {
      holders.forEach((h) => {
        h.classList.remove('open')
      })
    }
  }

  function prevItem() {
    if (indexOfActiveItem !== 0) {
      hideOutgoingItem()
      loadItem(items[indexOfActiveItem - 1])
    }
  }

  function nextItem() {
    if (indexOfActiveItem !== items.length - 1) {
      hideOutgoingItem()
      loadItem(items[indexOfActiveItem + 1])
    }
  }

  // -------- Setup once DOM is loaded -------- //

  window.addEventListener('DOMContentLoaded', checkPreconditions)
}(window, document))
