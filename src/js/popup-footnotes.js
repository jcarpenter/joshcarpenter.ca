(function (window, document) {
  'use strict'

  /** 
   * Create popups for footnotes.
   * - Copy contents of footnote into them.
   * - Add event listeners to link
   * - Show popup when 1) parent <sup> is hovered, or
   * - 2) the button is focused and aria-expanded="true"
   */
  function setup() {

    // Pointer/touch events are unreliable on Mobile Safari,
    // so we instead must use matchMedia to differentiate touch
    // versus non-touch devices. 
    const isTouch = window.matchMedia('(hover: none)').matches

    // Get footnotes
    const footnoteLinks = document.querySelectorAll('.fn-link')

    // For each...
    footnoteLinks.forEach((link) => {

      const sup = link.parentNode
      const index = sup.id.match(/\d+/)[0]

      link.setAttribute('aria-expanded', 'false')
      link.setAttribute('aria-controls', `fn${index}-popup`)
      link.setAttribute('aria-label', `Footnote ${index}`)

      // Create popup
      const popup = document.createElement('span')
      popup.id = `fn${index}-popup`
      popup.classList.add('fn-popup', 'above')
      // Populate popup with contents of associated footnote <li>.
      const contents = document.querySelector(`#fn${index}`).cloneNode(true).childNodes
      const frag = document.createDocumentFragment()
      frag.append(...contents)
      popup.append(frag)
      // Remove backlink, if it exists.
      popup.querySelector('a.fn-back')?.remove()
      // Add aria-live, so popup contents are read (for screen reader users) on change.
      popup.setAttribute('aria-live', 'polite')

      // Append popup
      sup.appendChild(popup)

      // Add link event listeners
      link.addEventListener('click', (e) => {
        console.log(isTouch)
        if (isTouch) {
          e.preventDefault()
          link.focus()
          const isExpanded = link.getAttribute('aria-expanded') == 'true'
          link.setAttribute('aria-expanded', !isExpanded)
        } else {
          // Do nothing. Link clicks normally.
          // window.location.hash = `#fn${index}`;
        }
      })

      // Toggle popup on 'enter' or 'space' key
      link.addEventListener('keydown', (e) => {
        console.log('keydown', e.key)
        if (e.key == ' ' || e.key == 'Enter') {
          e.preventDefault()
          const isExpanded = link.getAttribute('aria-expanded') == 'true'
          link.setAttribute('aria-expanded', !isExpanded)
        }
      })

      // Hide popup when <sup> no longer contains focused element.
      // `e.relatedTarget` gives us EventTarget receiving focus (if any).
      // Per https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/relatedTarget
      sup.addEventListener('focusout', (e) => {
        if (!sup.contains(e.relatedTarget)) {
          link.setAttribute('aria-expanded', 'false')
        }
      })

    })

    // Hide popup when user presses escape
    document.addEventListener('keyup', (e) => {
      if (e.key == 'Escape' || e.key == 'Esc') {
        const activeEl = document.activeElement
        if (activeEl.parentElement.classList.contains('fn')) {
          activeEl.blur()
        }
      }
    })

    /*
    Ensure selected footnotes blur() on Mobile Safari:

    Mobile Safari makes it difficult to deselect focused elements. Unlike other browsers, it does not deselect (blur) a focused element when the user clicks an empty area of the page. The element is only deselected when the user selects another focusable element, (or) taps the close button on the iOS keyboard. Apple probably does this to help users avoid closing the keyboard accidentally while entering forms.

    The fix here is simple:

    - If device has touchscreen, listen for `touchdown` pointer event on <main>
    - If the document.activeElement is a footnote link, blur it.
    */

    if (isTouch) {
      const main = document.querySelector('main')
      main.addEventListener('pointerdown', (e) => {
        const activeEl = document.activeElement
        if (activeEl.parentElement.classList.contains('fn')) {
          activeEl.blur()
        }
      })
    }

  }

  window.addEventListener('DOMContentLoaded', setup)
}(window, document))
