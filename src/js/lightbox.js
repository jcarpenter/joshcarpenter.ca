(function (window, document) {
  'use strict'

  // Elements
  let lightbox
  let close
  let prev
  let next
  let background
  let end
  let items = []
  let firstFocusableEl
  let lastFocusableEl

  // State
  let indexOfActiveItem = 0
  let lastItemFocused



  // -------- Load -------- //

  /**
   * Clone element. Into a holder div.
   * Holder is removed when transition on it ends and it doesn't have `open` class.
   * Holder > Media is populated with `src` version of image. 
   * We clone the original img element, then remove responsive attributes.
   */
  function loadItemByIndex(index) {

    // Create elements
    const item = document.createElement('div')
    const mediaWrapper = document.createElement('div')
    const caption = document.createElement('div')
    item.classList.add('item')
    mediaWrapper.classList.add('media')
    caption.classList.add('caption')
    item.appendChild(mediaWrapper)
    item.appendChild(caption)

    // Add item to DOM, before <span id="end"> element.
    lightbox.insertBefore(item, end)

    // Get media content (img, video, etc)
    // If media content is an image, remove responsive sizes and styles.
    // 1) We don't need these, and 2) they interfer with layout if left in.
    const media = items[index].media.cloneNode(true)
    if (media) {
      media.setAttribute('sizes', '100vw')
      media.removeAttribute('style')
    }

    // Populate mediaWrapper and captionWrapper with media and caption
    mediaWrapper.appendChild(media)
    caption.innerHTML = items[index].caption.innerHTML

    // Setup listener on item:
    // Remove item `ontransitionend` if classList does not contain `open`
    item.ontransitionend = () => {
      if (!item.classList.contains('open')) {
        item.remove()
      }
    }

    // Update URL with selected img id
    // E.g. http://joshcarpenter.ca/notes/rising-seas/?view=GMSL-1900-2010-lg-fig
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.set('view', items[index].id)
    url.search = params.toString()
    window.history.pushState('', '', url.toString())

    // Update `indexOfActiveItem` with the index of the id in the `items` array
    // We use it in prev/next functions to determine if we're at start or finish.
    // indexOfActiveItem = items.findIndex((item) => item === id)
    indexOfActiveItem = index

    // Update prev/next controls
    // Disable prev or next if we're on first or last image
    if (items.length > 1) {
      if (indexOfActiveItem === 0) {
        prev.setAttribute('aria-disabled', 'true')
        next.setAttribute('aria-disabled', 'false')
      } else if (indexOfActiveItem === items.length - 1) {
        prev.setAttribute('aria-disabled', 'false')
        next.setAttribute('aria-disabled', 'true')
      } else {
        prev.setAttribute('aria-disabled', 'false')
        next.setAttribute('aria-disabled', 'false')
      }
    }

    // Show lightbox, if it's not already visible
    if (!isOpen()) {
      openLightbox()
    }

    // Reveal new item by adding `.open` to its holder
    // Note: We must wait a few ms after appendChild(), or the initial values will not be set, and the element will appear in its final state. Per: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions#JavaScript_examples
    window.setTimeout(() => {
      item.classList.add('open')
    }, 5)
  }


  // -------- Show / Close -------- //

  /**
   * Check if aria-hidden == true or false
   * Convert string to boolean with equals operator
   * Then invert value with `!`, because aria-hidden="true" means "not open".
   */
  function isOpen() {
    return !(lightbox.getAttribute('aria-hidden') == 'true')
  }

  function openLightbox() {
    lightbox.setAttribute('aria-hidden', 'false')

    // Store currently focused element, so we can restore focus when we close lightbox 
    lastItemFocused = document.activeElement

    // Stop scrolling while lightbox is open
    // Adapted from: https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.top = `-${scrollY}px`

    // Set focus to close button
    close.focus()
  }

  function closeLightbox() {

    // Hide and empty
    lightbox.setAttribute('aria-hidden', 'true')
    emptyLightbox()

    // Update URL (clear hash)
    // Per: https://stackoverflow.com/a/2295951
    window.history.pushState('', '', window.location.pathname)

    // Null active item
    indexOfActiveItem = null

    // Restore focus() to the item last focused before lightbox opened (probably button) 
    lastItemFocused.focus()

    // Reactivate scrolling
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.top = ''
    window.scrollTo(0, parseInt(scrollY || '0') * -1)
  }

  function emptyLightbox() {
    // After fade out is complete, remove any instances of holder class
    const lightboxItems = lightbox.querySelectorAll('.item')

    lightboxItems.forEach((item) => {
      item.remove()
    })
  }


  // -------- Prev & Next -------- //

  /**
   * Remove the `open` class from the outgoing holder
   * This will trigger the opacity transition.
   * On transition complete, the ontransitionend event listener for the element (which we setup in loadItem) will trigger, and remove the holder from the lightbox.
  */
  function hideOutgoingItem() {
    const lightboxOpenItems = lightbox.querySelectorAll('.item.open')
    if (lightboxOpenItems) {
      lightboxOpenItems.forEach((item) => {
        item.classList.remove('open')
      })
    }
  }

  function prevItem() {
    if (indexOfActiveItem !== 0) {
      hideOutgoingItem()
      loadItemByIndex(indexOfActiveItem - 1)
    }
  }

  function nextItem() {
    if (indexOfActiveItem !== items.length - 1) {
      hideOutgoingItem()
      loadItemByIndex(indexOfActiveItem + 1)
    }
  }

  /**
   * Create keyboard tabbing trap: prevent tab or shift-tab from leaving the gallery.
   * If user tabs on last focusable element, loop them back to the first.
   * And vice versa for shift-tab.
   */
  function tab(e) {
    if (isOpen() && document.activeElement === lastFocusableEl) {
      e.preventDefault()
      firstFocusableEl.focus()
    }
  }

  function shiftTab(e) {
    if (isOpen() && document.activeElement === firstFocusableEl) {
      e.preventDefault()
      lastFocusableEl.focus()
    }
  }


  // -------- Setup -------- //

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

  /**
   * Add keyboard controls
   */
  function addKeyboardControls() {

    lightbox.addEventListener('keydown', (e) => {

      if (isOpen()) {
        
        if (e.defaultPrevented) return
        const key = e.key || e.keyCode

        if (key === 'Escape' || key === 'Esc' || key === 27) {
          closeLightbox()
        } else if (key === 'ArrowLeft' || key === 37) {
          if (items.length > 1) {
            prevItem()
          }
        } else if (key === 'ArrowRight' || key === 39) {
          if (items.length > 1) {
            nextItem()
          }
        } else if (key === 'Tab' || key === 9) {
          if (e.shiftKey) {
            shiftTab(e)
          } else {
            tab(e)
          }
        }
      }
    })
  }

  /**
   * Check search params and open lightbox if URL has valid view param.
   */
  function checkUrlHash() {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)

    // If there's a view param...
    if (params.has('view')) {
      // Check if there's an item with a matching ID.
      // If yes, load that item
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === params.get('view')) {
          loadItemByIndex(i)
        }
      }
    }
  }

  /**
   * Setup lightbox if preconditions are met:
   * - Viewport is large enough
   * - There are figures with data-lightbox=true
   */
  function setup() {

    // Check precondition: Is viewport is large enough?
    const islargeEnough = isViewportLargeEnough()
    if (!islargeEnough) return

    // Check precondition: Is there valid content?
    const lightboxFigures = document.querySelectorAll('figure[data-lightbox]')
    if (lightboxFigures.length == 0) return

    // Create lightbox
    lightbox = new DOMParser().parseFromString('<div id="lightbox" aria-label="Gallery" role="dialogue" aria-modal="true" aria-live="polite" aria-hidden="true"></div>', 'text/html').body.firstChild
    // lightbox = document.createElement('div')
    // lightbox.id = 'lightbox'
    // lightbox.setAttribute('role', 'dialogue')
    // lightbox.setAttribute('aria-label', 'Gallery')
    // lightbox.setAttribute('aria-modal', 'true')
    // lightbox.setAttribute('aria-live', 'polite')
    lightbox.innerHTML = `
      <button id="close" aria-label="Close gallery"><img src="/img/close.svg" alt="Close"></button>
      <button id="prev" aria-label="Previous"><img src="/img/arrow.svg" alt="Previous"></button>
      <button id="next" aria-label="Next"><img src="/img/arrow.svg" alt="Next"></button>
      <span tabindex="0" class="visibility-hidden" id="end">End of gallery</span>
      <div id="background"></div>`
    document.body.append(lightbox)

    // Get elements
    close = lightbox.querySelector('#close')
    prev = lightbox.querySelector('#prev')
    next = lightbox.querySelector('#next')
    background = lightbox.querySelector('#background')
    end = lightbox.querySelector('#end')

    // Set focusable elements
    // We use these variables to trap tabs inside modal.
    // See tab() and shiftTab() functions
    firstFocusableEl = close
    lastFocusableEl = end

    // For each `data-lightbox` figure...
    lightboxFigures.forEach((figure, index) => {

      // Store relevant information in a new object in the `items` array
      const newItem = {
        id: figure.id,
        media: figure.querySelector('.thumb'),
        type: figure.getAttribute('data-lightbox'),
        caption: figure.querySelector('figcaption')
      }
      items.push(newItem)

      const thumb = figure.querySelector('.thumb')

      // Create button. Move thumb inside it.
      // `onclick`, button loads item
      const button = document.createElement('button')
      button.setAttribute('aria-controls', 'lightbox')
      button.setAttribute('aria-label', `Open ${newItem.type} in gallery`)
      button.id = `${figure.id}-btn`
      button.appendChild(thumb)
      button.onclick = (e) => {
        e.preventDefault()
        loadItemByIndex(index)
      }
      figure.prepend(button)
    })

    // Add event listeners
    close.onclick = () => closeLightbox()
    background.onclick = () => closeLightbox()
    prev.onclick = () => prevItem()
    next.onclick = () => nextItem()

    // If there's only one item, hide prev and next buttons.
    if (items.length == 1) {
      prev.setAttribute('aria-hidden', 'true')
      next.setAttribute('aria-hidden', 'true')
    }

    // Add keyboard controls
    addKeyboardControls()

    // On load, check URL hash
    checkUrlHash()
  }

  window.addEventListener('DOMContentLoaded', setup)
}(window, document))
