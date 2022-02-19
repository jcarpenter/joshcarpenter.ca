/*
Handle prev and next buttons in slideshows
*/

(function(window, document) {
  'use strict'

  /** Handle intersection observer intersections */
  function onIntersection(entries) {
    // console.log(entries)
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const li = entry.target
        const index = Array.from(li.parentNode.children).indexOf(li)
      }
    })

    // entries.forEach((entry) => {
    //   if (entry.isIntersecting) {
    //     // Update variable
    //     indexOfActiveItem = parseInt(entry.target.dataset.index)

    //     // Add 'loaded' class
    //     if (!entry.target.classList.contains('loaded')) {
    //       entry.target.classList.add('loaded')
    //     }
    //   }
    //   // Play/pause videos
    //   // const isVideo = entry.target.dataset.type == 'video'
    //   // if (isVideo && entry.isIntersecting) {
    //   //   const video = entry.target.querySelector('video')
    //   //   // TODO
    //   // } else if (isVideo && !entry.isIntersecting) {
    //   //   // const video = entry.target.querySelector('video')
    //   // }
    // })

    // // Update arrows
    // if (list.children.length > 1) {
    //   if (indexOfActiveItem == 1) {
    //     prev.disabled = true
    //     next.disabled = false
    //   } else if (indexOfActiveItem == list.children.length) {
    //     prev.disabled = false
    //     next.disabled = true
    //   } else {
    //     prev.disabled = false
    //     next.disabled = false
    //   }
    // }
  }

  /**
   * Scroll to previous list item
   */
  // function prevItem() {
  //   const indexOfActiveItem =
  //   const li = list.querySelector(`:scope > li:nth-child(${indexOfActiveItem - 1})`)
  //   li.scrollIntoView()
  // }

  // /**
  //  * Scroll to next list item
  //  */
  // function nextItem() {
  //   console.log('next')
  //   // const items = list.querySelectorAll(':scope > li')
  //   // if (indexOfActiveItem !== items.length) {
  //   //   const li = list.querySelector(`:scope > li:nth-child(${indexOfActiveItem + 1})`)
  //   //   li.scrollIntoView()
  //   // }
  // }


  /** Setup a slideshow */
  function setupSlideshow(slideshow) {
    const prev = slideshow.querySelector('.prev')
    const next = slideshow.querySelector('.next')
    const ul = slideshow.querySelector('ul')

    prev.addEventListener('click', (e) => {
      const index = parseInt(slideshow.dataset.selected)
      const li = ul.querySelector(`:scope > li:nth-child(${index - 1})`)
      li.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})
    })

    next.addEventListener('click', (e) => {
      const index = parseInt(slideshow.dataset.selected)
      const li = ul.querySelector(`:scope > li:nth-child(${index + 1})`)
      li.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})
    })

    // Setup intersection observer
    const observer = new IntersectionObserver((entries) => {
      let index

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const li = entry.target
          index = Array.from(li.parentNode.children).indexOf(li) + 1
          slideshow.setAttribute('data-selected', index)
        }
      })

      // Update arrows
      prev.disabled = index == 1
      next.disabled = index == ul.children.length
    }, {

      // Scrollable element to watch for intersections with.
      // Usually will be closest ancestor. Set as `null` to
      // watch for intersection relative to the viewport.
      root: ul,

      // Threshold of intersection between the target element
      // and its root. When reached, callback function is called.
      threshold: 0.5,

    })

    // Observe list items
    slideshow.querySelectorAll('li').forEach((li, index) => {
      observer.observe(li)
    })
  }

  /**
   * Find and setup slideshows
   */
  function onPageLoad() {
    const slideshows = document.querySelectorAll('.gallery')
    slideshows.forEach((slideshow, index) => {
      setupSlideshow(slideshow)
    })
  }

  window.addEventListener('DOMContentLoaded', onPageLoad)
}(window, document))
