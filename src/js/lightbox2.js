(function(window, document) {
  'use strict'

  let lightbox
  let close
  let prev
  let next
  let list
  let end
  let background
  let observer
  const items = []
  let firstFocusableEl
  let lastFocusableEl

  // State
  let indexOfActiveItem = 0
  let lastItemFocused


  // -------- Load -------- //

  /**
   * Scroll to the <li> specified by `index`.
   * @param {*} index - Index of <li> to load
   * @param {boolean} animate - Animate on scroll? False to jump instantly.
   */
  function selectItemByIndex(index = 1, animate = true) {
    // Update variable
    indexOfActiveItem = index

    // Show lightbox, if it's not already visible
    if (!isOpen()) {
      openLightbox()
    }

    // Get selected list item
    const li = list.querySelector(`:scope > li:nth-child(${index})`)

    // li.classList.add('selected')
    // const otherItems = list.querySelectorAll(`:scope > li:not(:nth-child(${index}))`)
    // otherItems.forEach((item) => {
    //   item.classList.remove('selected')
    // })

    // Get all list items
    const items = list.querySelectorAll(':scope > li')

    // Scroll to selected list item
    if (!animate) {
      // To jump instantly (instead of animated scroll)
      // we modify scrollBehavior to not animate,
      // scroll, then re-enable. animation.
      list.style.scrollBehavior = 'auto'
      li.scrollIntoView()
      list.style.scrollBehavior = 'smooth'
    } else {
      li.scrollIntoView()
    }
  }


  // -------- Prev & Next -------- //

  /**
   * Scroll to previous list item
   */
  function prevItem() {
    if (indexOfActiveItem !== 1) {
      const li = list.querySelector(`:scope > li:nth-child(${indexOfActiveItem - 1})`)
      li.scrollIntoView()
    }
  }

  /**
   * Scroll to next list item
   */
  function nextItem() {
    const items = list.querySelectorAll(':scope > li')
    if (indexOfActiveItem !== items.length) {
      const li = list.querySelector(`:scope > li:nth-child(${indexOfActiveItem + 1})`)
      li.scrollIntoView()
    }
  }

  /**
   * Create keyboard tabbing trap: prevent tab or shift-tab from leaving the gallery.
   * If user tabs on last focusable element, loop them back to the first.
   * And vice versa for shift-tab.
   */
  function tab(e) {
    console.log('tab')
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

  // -------- Show / Close -------- //

  function openLightbox() {
    lightbox.setAttribute('aria-hidden', 'false')

    // Get all the data-lightbox elements
    // These are either a media element, or a wrapper around a media element.
    const thumbs = document.querySelectorAll('[data-lightbox]')

    thumbs.forEach((thumb, index) => {
      // Get the media element associated with the thumb.
      // This is either the thumb itself, or a child inside the thumb,
      // (as in case where we wrap the media in a div, or some such).
      const thumbIsMedia = ['picture', 'img', 'video'].includes(thumb.localName)
      const media = thumbIsMedia ? thumb : thumb.querySelector('picture, img, video')

      // Clone media inside thumb and prune un-needed attributes
      const clone = media.cloneNode(true)
      clone.removeAttribute('style')
      clone.removeAttribute('class')
      clone.removeAttribute('data-lightbox')
      clone.removeAttribute('aria-controls')
      clone.removeAttribute('aria-label')
      clone.removeAttribute('tabindex')

      // If media is video, add controls attribute
      if (media.localName == 'video') {
        clone.setAttribute('controls', '')
      }

      // Append clone to a new container div,
      // inside a new list item
      const container = document.createElement('div')
      container.classList.add('container')
      container.appendChild(clone)
      const li = document.createElement('li')
      li.append(container)
      li.setAttribute('data-index', index + 1)
      li.setAttribute('data-type', media.localName.toLowerCase())

      // Copy figcaption (if one exists)
      // const figcaption = fig.querySelector('figcaption')
      // if (figcaption) {
      //   const caption = document.createElement('div')
      //   caption.classList.add('caption')
      //   caption.innerHTML = figcaption.innerHTML
      //   li.append(caption)
      // }

      // Watch with intersection observer
      observer.observe(li)

      // Append the item to the list
      list.append(li)
    })

    // Hide prev/next buttons if there's only one item
    if (thumbs.length == 1) {
      prev.setAttribute('aria-hidden', 'true')
      next.setAttribute('aria-hidden', 'true')
    } else {
      prev.setAttribute('aria-hidden', 'false')
      next.setAttribute('aria-hidden', 'false')
    }

    // Set background color of body to match lightbox.
    // Looks better in Mobile Safari.
    document.body.classList.add('lightbox-open')

    // Store currently focused element, so we can restore focus when we close lightbox
    lastItemFocused = document.activeElement

    // Stop scrolling while lightbox is open
    // Wait until background fades in to do this,
    // or users will see a jump.
    background.addEventListener('transitionend', () => {
      disableDocScrolling()
    }, {once: true})


    // Focus the list
    list.focus()
    // firstFocusableEl.focus()
  }


  function closeLightbox() {
    // Stop intersection observer from observing all targets
    observer.disconnect()

    // Hide lightbox and remove items
    lightbox.setAttribute('aria-hidden', 'true')
    emptyLightbox()

    // Update URL (clear hash)
    // Per: https://stackoverflow.com/a/2295951
    window.history.pushState('', '', window.location.pathname)

    // Null active item
    indexOfActiveItem = null

    // Restore background color by clearing class
    document.body.classList.remove('lightbox-open')

    // Restore focus() to the item last focused before lightbox opened (probably button)
    lastItemFocused.focus()

    // Re-enable scrolling
    restoreDocScrolling()
  }


  /**
   * Check if aria-hidden == true or false
   * Convert string to boolean with equals operator
   * Then invert value with `!`, because aria-hidden="true" means "not open".
   */
  function isOpen() {
    return !(lightbox.getAttribute('aria-hidden') == 'true')
  }


  /**
   * Stop doc from scrolling while Lightbox is open
   * Adapted from: https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
   */
  function disableDocScrolling() {
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    // document.body.style.width = '100%'
  }


  /**
   * Re-enable document scrolling
   */
  function restoreDocScrolling() {
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    // document.body.style.width = ''
    window.scrollTo(0, parseInt(scrollY || '0') * -1)
  }


  /**
   * Delete lightbox items
   */
  function emptyLightbox() {
    const items = lightbox.querySelectorAll('ul li')
    items.forEach((item) => {
      item.remove()
    })
  }


  // -------- Setup -------- //

  /**
   * Add keyboard controls
   */
  function addKeyboardControls() {
    lightbox.addEventListener('keydown', (e) => {
      if (isOpen()) {
        // if (e.defaultPrevented) return
        switch (e.key) {
          case 'Escape':
          case 'Esc':
            closeLightbox()
            break
          case 'ArrowLeft':
            prevItem()
            break
          case 'ArrowRight':
            nextItem()
            break
          case 'Tab':
            if (e.shiftKey) {
              shiftTab(e)
            } else {
              tab(e)
            }
            break
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
          selectItemByIndex(i)
        }
      }
    }
  }


  function onIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Update variable
        indexOfActiveItem = parseInt(entry.target.dataset.index)

        // Add 'loaded' class
        if (!entry.target.classList.contains('loaded')) {
          entry.target.classList.add('loaded')
        }
      }
      // Play/pause videos
      // const isVideo = entry.target.dataset.type == 'video'
      // if (isVideo && entry.isIntersecting) {
      //   const video = entry.target.querySelector('video')
      //   // TODO
      // } else if (isVideo && !entry.isIntersecting) {
      //   // const video = entry.target.querySelector('video')
      // }
    })

    // Update arrows
    if (list.children.length > 1) {
      if (indexOfActiveItem == 1) {
        prev.disabled = true
        next.disabled = false
      } else if (indexOfActiveItem == list.children.length) {
        prev.disabled = false
        next.disabled = true
      } else {
        prev.disabled = false
        next.disabled = false
      }
    }
  }


  function setup() {
    // Get elements
    lightbox = document.getElementById('lightbox')
    close = lightbox.querySelector('button#close')
    prev = lightbox.querySelector('button#prev')
    next = lightbox.querySelector('button#next')
    list = lightbox.querySelector('ul')
    end = lightbox.querySelector('span#end')
    background = lightbox.querySelector('div#background')

    // Set focusable elements
    // We use these variables to trap tabs inside modal.
    // See tab() and shiftTab() functions
    firstFocusableEl = close
    lastFocusableEl = end

    const thumbs = document.querySelectorAll('[data-lightbox]')

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault()
        selectItemByIndex(index + 1, false)
      })
      thumb.addEventListener('keydown', (e) => {
        if (e.key == 'Enter') {
          e.preventDefault()
          selectItemByIndex(index + 1, false)
        }
      })
    })


    // Prep media elements inside article #body copy:
    // - Add attributes, classes
    // - Add event listener so they open on click
    // const mediaElements = document.querySelectorAll(`
    //   article #body picture,
    //   article #body video,
    //   article #body *:not(picture) > img
    // `)

    // mediaElements.forEach((media, index) => {
    //   const type = media.localName == 'video' ? 'video' : 'image'
    //   media.setAttribute('aria-label', `Open ${type} in gallery`)
    //   media.setAttribute('aria-controls', 'lightbox')
    //   media.setAttribute('tabindex', 0)
    //   media.classList.add('opens-lightbox')
    //   media.addEventListener('click', (e) => {
    //     e.preventDefault()
    //     selectItemByIndex(index + 1, false)
    //   })
    //   media.addEventListener('keydown', (e) => {
    //     if (e.key == 'Enter') {
    //       e.preventDefault()
    //       selectItemByIndex(index + 1, false)
    //     }
    //   })
    // })

    // Setup intersection observer
    observer = new IntersectionObserver(onIntersection, {

      // Scrollable element to watch for intersections with.
      // Usually will be closest ancestor. Set as `null` to
      // watch for intersection relative to the viewport.
      root: null,

      // Threshold of intersection between the target element
      // and its root. When reached, callback function is called.
      threshold: 0.5,

    })

    // Add button event listeners
    close.onclick = () => closeLightbox()
    prev.onclick = () => prevItem()
    next.onclick = () => nextItem()
    list.onclick = () => list.focus()

    // Add keyboard event listeners
    addKeyboardControls()

    // On load, check URL hash
    // checkUrlHash()
  }

  window.addEventListener('DOMContentLoaded', setup)
}(window, document))
