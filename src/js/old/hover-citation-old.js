(function(window, document) {
  'use strict'

  // If mouse button down, don't trigger (protect against selections)
  // Delay hiding. So user has time to hover over item.
  // Apply listener to article.

  let article; let popup
  const intervalTick = 100 // ms
  let enterTimer; let exitTimer // SetIntervals
  let isEnterTimerActive; let isExitTimerActive // bool
  const enterDelay = 100 // ms
  const exitDelay = 150 // ms
  const enterElapsed = 0
  const exitElapsed = 0
  let isPopupOpen
  const isMouseDown = 0


  function makePopup() {
    popup = document.createElement('div')
    popup.id = 'fn-popup'
    // popup.classList.add('hide', 'footnote-item') // Hide popup to start
    // popup.classList.add('hide', 'footnote-item') // Hide popup to start
    document.body.appendChild(popup)
  }

  // function updatePopup(link) {
  //   // Prepare citation node
  //   const href = link.getAttribute('href')
  //   const citation = article.querySelector(href + '> p')
  //   const clone = citation.cloneNode(true)
  //   const backLink = clone.querySelector('.footnote-backref')
  //   clone.removeChild(backLink)

  //   // Prepare popup
  //   emptyPopup()
  //   popup.appendChild(clone)
  //   popup.classList.remove('popup-hide')

  //   // Append popup to link
  //   link.appendChild(popup)
  // }

  // function emptyPopup() {
  //   while (popup.firstChild) {
  //     popup.removeChild(popup.firstChild)
  //   }
  // }


  function setupLinks() {
    makePopup()

    // article = document.querySelector('main>article')

    // const links = article.querySelectorAll('.footnote-ref')
    // let currentHoveredElement

    // // Setup mouse button listeners
    // document.body.onmousedown = function() {
    //   isMouseDown = true
    // }

    // document.body.onmouseup = function() {
    //   isMouseDown = false
    // }

    // // Setup article listeners
    // article.onmouseover = function(event) {
    //   // If mouse button is down, we assume user is selecting,
    //   // and don't want to trigger the hover popup logic
    //   if (isMouseDown) return

    //   // We only care about footnote-ref links, and the footnote popup
    //   if (!event.target.classList.contains('footnote-ref') && event.target.id != 'footnote-popup') {
    //     // console.log("nope")
    //     return
    //   }

    //   currentHoveredElement = event.target
    //   onEnter(currentHoveredElement)
    // }

    // article.onmouseout = function(event) {
    //   // If mouse button is down, we assume user is selecting,
    //   // and don't want to trigger the hover popup logic
    //   if (isMouseDown) return

    //   // If currentHoveredElement is null, it means whatever is being exited
    //   // isn't of interest to us, since we only populate it when we're over
    //   // a footnote link or footnote popup.
    //   if (!currentHoveredElement) return

    //   // We're leaving the element – where to? Maybe to a descendant?
    //   let relatedTarget = event.relatedTarget

    //   while (relatedTarget) {
    //     // Go up the parent chain and check – if we're still inside currentElem
    //     // then that's an internal transition – ignore it
    //     if (relatedTarget == currentHoveredElement) return

    //     relatedTarget = relatedTarget.parentNode
    //   }

    //   onLeave(currentHoveredElement)
    //   currentHoveredElement = null
    // }
  }

  // function onEnter(link) {
  //   // If exit timer is active, stop it
  //   if (isExitTimerActive) {
  //     clearInterval(exitTimer)
  //     isExitTimerActive = false
  //   }

  //   // Only proceed to do anything if we're over a footnote-ref link
  //   if (link.classList.contains('footnote-ref')) {
  //     // If the popup is already open, simply update it. This happens
  //     // when hovering over two adjacent footnote-ref links. We don't
  //     // want a delay when moving to the neighbour.

  //     // If the popup is NOT already open, delay opening it by the
  //     // `enterTimer` amount.

  //     if (isPopupOpen) {
  //       updatePopup(link)
  //     } else {
  //       isEnterTimerActive = true
  //       enterTimer = setInterval(function() {
  //         if (enterElapsed > enterDelay) {
  //           enterElapsed = 0
  //           clearInterval(enterTimer)
  //           isEnterTimerActive = false
  //           isPopupOpen = true
  //           updatePopup(link)
  //           // console.log(link)
  //         } else {
  //           // console.log(enterElapsed)
  //           enterElapsed += intervalTick
  //         }
  //       }, intervalTick)
  //     }
  //   }
  // }

  // function onLeave(link) {
  //   // If enter delay time is already active
  //   if (isEnterTimerActive) {
  //     enterElapsed = 0
  //     clearInterval(enterTimer)
  //     isEnterTimerActive = false
  //   }

  //   if (isPopupOpen) {
  //     exitElapsed = 0
  //     isExitTimerActive = true

  //     exitTimer = setInterval(function() {
  //       if (exitElapsed > exitDelay) {
  //         popup.classList.add('popup-hide')
  //         clearInterval(exitTimer)
  //         isExitTimerActive = false
  //         isPopupOpen = false
  //         // console.log("exitTimer DONE")
  //       } else {
  //         exitElapsed += intervalTick
  //       }
  //     }, intervalTick)
  //   }
  // }

  // Fix once on first page load
  window.addEventListener('DOMContentLoaded', setupLinks)
}(window, document))
