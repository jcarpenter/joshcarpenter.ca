(function (window, document) {
  'use strict'

  function setup() {
    // Get article
    const article = document.querySelector('main article')

    // Get footnotes
    const footnoteLinks = document.querySelectorAll('.fn-link')

    // Setup popups, link attributes, and event listeners
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

    // Remove footnotes <section>
    document.querySelector('#footnotes').remove()


    /* 
    Ensure selected footnotes blur() on Mobile Safari:
    
    Mobile Safari makes it difficult to deselect focused elements. Unlike other browsers, it does not deselect (blur) a focused element when the user clicks an empty area of the page. The element is only deselected when the user selects another focusable element, (or) taps the close button on the iOS keyboard. Apple probably does this to help users avoid closing the keyboard accidentally while entering forms.

    The fix here is simple:

    - If device has touchscreen, listen for `touchdown` pointer event on <main>
    - If the document.activeElement is a footnote link, blur it.
    */

    /**
     * Detect if device has touchscreen.
     * We only want to add our "blur on touch" event listeners when Mobile Safari is being used. The best we can do is check for touchscreen. The following is taken from MDN: https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
     */
    function hasTouchScreen() {
      
      let hasTouch = false;
      if ("maxTouchPoints" in navigator) {
        hasTouch = navigator.maxTouchPoints > 0;
      } else if ("msMaxTouchPoints" in navigator) {
        hasTouch = navigator.msMaxTouchPoints > 0;
      } else {
        const mQ = window.matchMedia && matchMedia("(pointer:coarse)");
        if (mQ && mQ.media === "(pointer:coarse)") {
          hasTouch = !!mQ.matches;
        } else if ('orientation' in window) {
          hasTouch = true; // deprecated, but good fallback
        } else {
          // Only as a last resort, fall back to user agent sniffing
          const UA = navigator.userAgent;
          hasTouch = (
            /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
            /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
          );
        }
      }

      return hasTouch
    }

    if (hasTouchScreen()) {
      
      const main = document.querySelector('main')
      main.addEventListener('pointerdown', (e) => {
        let activeEl = document.activeElement
        if (document.activeElement.classList.contains('fn-link')) {
          activeEl.blur()
          console.log("blur")
        }
      })
    }

    return
  }

  window.addEventListener('DOMContentLoaded', setup)
}(window, document))
