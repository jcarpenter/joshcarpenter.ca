// Adapted from https://github.com/matejlatin/Gutenberg/blob/master/src/js/main.js

(function(window, document) {
  'use strict'

  let flip = 2

  function highlightBlocks(toggle) {
    const blocks = document.body.querySelectorAll('h1, h2, h3, p blockquote, figure, figcaption, ol, p, pre, table, ul, address, address a, address time')

    if (toggle === true) {
      blocks.forEach(function(b) {
        b.classList.add('blockHighlight')
      })
    } else if (toggle === false) {
      blocks.forEach(function(b) {
        b.classList.remove('blockHighlight')
      })
    }
  }

  function toggleGrid() {
    // const button = document.getElementById('btnGrid')

    if (flip === 0) {
      // button.textContent = 'Grid'
      document.body.classList.add('backgroundGrid')
      flip = 1
    } else if (flip === 1) {
      // button.textContent = 'All'
      document.body.classList.add('backgroundGrid')
      highlightBlocks(true)
      flip = 2
    } else if (flip === 2) {
      // button.textContent = 'None'
      document.body.classList.remove('backgroundGrid')
      highlightBlocks(false)
      flip = 0
    }
  }

  function addBtn() {
    window.addEventListener('keydown', (e) => {
      if (e.key == 'g') {
        toggleGrid()
      }
    })

    // const btnGrid = document.createElement('button')
    // btnGrid.id = 'btnGrid'
    // btnGrid.textContent = 'None'
    // btnGrid.onclick = toggleGrid
    // document.body.appendChild(btnGrid)
    // toggleGrid()
  }

  window.addEventListener('DOMContentLoaded', addBtn)
}(window, document))
