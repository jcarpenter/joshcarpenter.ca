/*
Fix for Mobile Safari focus/blur behaviour
-------------------------------------------

Mobile Safari makes it difficult to deselect focused elements. Unlike other browsers, it does not deselect (blur) a focused element when the user clicks an empty area of the page. The element is only deselected when the user selects another focusable element, (or) taps the close button on the iOS keyboard. Apple probably does this to help users avoid closing the keyboard accidentally while entering forms.

Our fix is simple:

* Listen for pointer events on <main>
* If the event type was touch...
* If the `selected` variable != null, blur it, and set `selected` to null.
* If the pointer target element == button, set it as `selected`

*/

(function(window, document) {
  'use strict'

  function setup() {
    const main = document.querySelector('main > article')
    let selected

    if (window.PointerEvent) {
      main.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch') {
          if (selected) {
            selected.blur()
            selected = null
          }

          if (e.target.tagName === 'BUTTON') {
            selected = e.target
          }
        }
      })
    }
  }

  window.addEventListener('DOMContentLoaded', setup)
}(window, document))
