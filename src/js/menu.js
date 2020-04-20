(function(window, document) {
  'use strict'

  let button
  let navTop
  let focusables
  let firstFocusable
  let isOpen = false


  // -------- Add keyboard interactions -------- //

  // Add keyboard controls
  function addKeyboardControls() {
    // Add escape key listener (hides lightbox)
    document.addEventListener('keyup', (e) => {
      if (e.defaultPrevented) return

      const key = e.key || e.keyCode

      if (key === 'Escape' || key === 'Esc' || key === 27) {
        if (isOpen) {
          toggle()
        }
      } else if (key === 'Tab' || key === 9) {
        e.preventDefault()

        // Is shift pressed? e.shiftKey is a boolean.
        // Per: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/shiftKey

        if (e.shiftKey) {
          console.log('Shift Tab')
        } else {
          console.log('Tab')
        }
      }
    })
  }

  // -------- Set focus -------- //

  // function setFocus() {

  // }


  // -------- Toggle open/close -------- //

  function toggle() {
    isOpen = !isOpen

    hamburger.classList.toggle('open')
    navTop.classList.toggle('open')

    if (isOpen) {
      // Focus first focusable element (should be hamburger button)
      firstFocusable.focus()
    }
  }

  // -------- Prevent tabbing outside menu (when open) -------- //

  // "User navigating with a keyboard should not be able to TAB out of the dialog content". If users presses tab from the last focusable element, move them to the first focusable element. And the inverse, if they tab backware (Shift + Tab), from the first focusable element.
  // Per: https://bitsofco.de/accessible-modal-dialog/

  // function backwardTab() {

  // }

  // function forwardTab() {

  // }

  // -------- Setup -------- //

  function cloneFootnote() {
    const testBtn = document.getElementById('testBtn')
    const fn = document.getElementById('fn1').cloneNode(true)
    testBtn.after(fn)
  }

  function setup() {
    // ------- TEST ------- //

    const testBtn = document.getElementById('testBtn')

    testBtn.onclick = () => {
      cloneFootnote()
    }

    // testBtn.addEventListener('pointerup', cloneFootnote)

    // testBtn.addEventListener('keydown', e => {

    //   const key = e.key || e.keyCode

    //   // Listen for enter and spacebar presses
    //   if (key === 'Enter' || key === 13 || key === ' ' || key === 32) {
    //     cloneFootnote()
    //   }
    // })


    // ------- TEST (END) ------- //

    // Get elements
    button = document.getElementById('hamburger')
    navTop = document.querySelector('nav#top')

    // Get focusable elements (NodeList)
    focusables = navTop.querySelectorAll('a[href], [tabindex="0"]')

    // Convery NodeList to array, so we can work with it
    focusables = Array.prototype.slice.call(focusables)

    // Add button to array (first position)
    focusables.unshift(button)

    // Store first and last focusable element
    firstFocusable = focusables[0]
    lastFocusable = focusables[focusables.length - 1]

    // Add hamburger button listener
    if (window.PointerEvent) {
      button.addEventListener('pointerup', toggle)
    }

    // Add escape button listener
    addKeyboardControls()
  }

  // -------- Setup once DOM is loaded -------- //

  window.addEventListener('DOMContentLoaded', setup)
}(window, document))
