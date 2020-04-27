(function (window, document) {
  'use strict'

  function setup() {

    let links = document.querySelectorAll('.fn-link')

    for (const link of links) {
      link.setAttribute('role', 'button')

      link.onclick = (e) => {
        e.preventDefault()
      }
    }


    // link.addEventListener('click', (e) => {
    //   console.log("Click")
    //   e.stopPropagation()
    //   e.preventDefault()
    //   return false
    // })

    // link.addEventListener('keydown', (e) => {
    //   const key = e.key || e.keyCode
    //   if (key === 'Enter' || key === 13 || key === ' ') {
    //     console.log("Keyboard press")
    //     e.preventDefault()
    //     return false
    //   }
    // })

    // let links = document.querySelectorAll('main a')
    // for (const link of links) {
    //   link.onclick = (e) => {
    //     e.preventDefault()
    //     console.log("Click")
    //     return false
    //   }
    // }
  }
  window.addEventListener('DOMContentLoaded', setup)
}(window, document))
