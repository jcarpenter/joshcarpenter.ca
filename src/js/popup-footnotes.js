(function(window, document) {
  'use strict'

  function setup() {
    // Setup postBody
    const article = document.querySelector('main article')

    // Setup footnotes
    const footnoteLinks = document.querySelectorAll('.fn-link')

    for (const link of footnoteLinks) {
      // Create `.fn` wrapper span
      const span = document.createElement('span')
      span.classList.add('fn')
      link.parentNode.insertBefore(span, link)
      span.appendChild(link)

      span.addEventListener('focusout', (e) => {
        // If span does not contain the new focus target, it has lost focus.
        // `e.relatedTarget` of focusout returns "The EventTarget receiving focus (if any)".
        // Per https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/relatedTarget
        if (!span.contains(e.relatedTarget)) {
          span.classList.remove('show')
        }
      })

      // Setup popup
      const popup = document.createElement('span')
      popup.classList.add('fn-popup', 'above')
      // Add aria-live, so popup contents are read (for screen reader users) on change.
      popup.setAttribute('aria-live', 'polite')
      // Clone contents of the selected footnote.
      // Set cloneNode `deep` argument true, so we get children.
      // E.g. <li id="fn1">[this content]</li>
      // Get id from link href. E.g. `fn1` after we trim the #.
      const id = link.getAttribute('href').substring(1)
      const contents = article.querySelector(`#${id} *`)
      const backlink = contents.querySelector('.fn-back')
      if (backlink) contents.remove(backlink)
      popup.appendChild(contents)
      span.appendChild(popup)

      // Add role="button" and preventDefault to `click` event.
      /* Together, these prevent screen readers from triggering link navigation on `click`. Screen readers seem to ignore preventDefault() for links, but accept it for buttons. Per this thread: https://twitter.com/joshcarpenter/status/1253764021037064192?s=20 */
      link.setAttribute('role', 'button')
      link.setAttribute('aria-expanded', 'false')

      // `click` event is trigger by both mouse clicks, and screen reader "clicks".
      link.onclick = (e) => {
        e.preventDefault()
        span.classList.toggle('show')
        const isExpanded = (link.getAttribute('aria-expanded') == 'true')
        link.setAttribute('aria-expanded', !isExpanded)
      }

      span.addEventListener('focusout', (e) => {
        // If span does not contain the new focus target, it has lost focus.
        // `e.relatedTarget` of focusout returns "The EventTarget receiving focus (if any)".
        // Per https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/relatedTarget
        if (!span.contains(e.relatedTarget)) {
          link.setAttribute('aria-expanded', 'false')
        }
      })
    }

    document.querySelector('#footnotes').remove()

    return
  }

  window.addEventListener('DOMContentLoaded', setup)
}(window, document))
