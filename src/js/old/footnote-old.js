(function (window, document) {
  'use strict'

  let activeFootnote = null

  // -------- Add keyboard interactions -------- //

  function add(span, link) {

    // Prevent multiple footnotes on same span. Important, because we call add() from both click and pointerup events, which gaurantees this function is called twice every click/tap.
    // Else, remove() the activefootnote. Important be
    if (activeFootnote == span) {
      return
    } else if (activeFootnote !== null) {
      remove(activeFootnote)
    }

    // Get id from link href.
    // E.g. fn1 (after we trim the `#`)
    const id = link.getAttribute('href').substring(1)

    // Clone contents of the selected footnote.
    // Set cloneNode `deep` argument true, so we get children.
    // E.g. <li id="fn1">[this content]</li>
    const contents = document.querySelector(`#${id} *`).cloneNode(true)
    let backlink = contents.querySelector('.fn-back-link')
    if (backlink) contents.remove(backlink)

    // Create wrapping span
    let popup = document.createElement('span')
    popup.classList.add('popup', 'above')
    popup.appendChild(contents)

    // Append popup to span
    span.appendChild(popup)

    activeFootnote = span

    // Wait a beat then add `open` class
    // We have to delay between creating an element and adding a classes, or the initial values will not be set, and the element will appear in its final state. Per: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions#JavaScript_examples
    window.setTimeout(() => {
      popup.classList.add('open')
    }, 5)    

    // window.location.hash = href.substring(1)

    popup.ontransitionend = () => {
      if (document.activeElement != span) {
        console.log("Hi there")
      }
    }
  }

  function remove(span) {

    if (activeFootnote == span) activeFootnote = null
    const contents = span.querySelector('.popup')
    if (contents) span.removeChild(contents)
  }

  function setupListeners(span) {

    let link = span.querySelector('a')

    // span.addEventListener('focusout', (e) => {
    //   // If span does not contain the new focus target, it has lost focus.
    //   // `e.relatedTarget` of focusout returns "The EventTarget receiving focus (if any)".
    //   // Per https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/relatedTarget
    //   if (!span.contains(e.relatedTarget)) {
    //     remove(span)
    //   }
    // })

    span.addEventListener('focusin', () => {
      
    })

    link.addEventListener('keydown', (e) => {
      const key = e.key || e.keyCode
      if (key === 'Enter' || key === 13) {
        e.preventDefault()
        add(span, link)
      }
    })

    // link.addEventListener('click', (e) => {
    //   e.preventDefault()
    //   add(span, link)
    // })

    // link.addEventListener('pointerup', (e) => {
    //   e.preventDefault()
    //   add(span, link)
    // })

    link.addEventListener('pointerover', () => {
      add(span, link)
    })

    // link.addEventListener('pointerout', (e) => {
    //   remove(span)
    // })
  }

  function setup() {

    let footnotes = document.querySelectorAll('.fn')

    for (let span of footnotes) {
      setupListeners(span)
    }
  }

  window.addEventListener('DOMContentLoaded', setup)
}(window, document))
