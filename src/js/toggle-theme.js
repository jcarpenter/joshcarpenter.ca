/*
Handle setting light and dark color themes on the page.
On page load, by default we follow the system preference.
As soon as the user clicks the toggle button, we switch
to their manually indicated preference, and remember it
for future visits using local storage.
*/

(function(window, document) {
  'use strict'


  /**
   * Set the body attribute and (optionally) save user
   * preference to local storage.
   * @param {string} newTheme - 'dark' or 'light'
   * @param {boolean} wasSetManually
   */
  function setTheme(newTheme, wasSetManually) {
    // Update body attribute
    document.body.setAttribute('data-theme', newTheme)

    // Save user preference using local storage
    if (wasSetManually) {
      localStorage.setItem('user-theme-preference', newTheme)
    }

    // Update label
    const label = document.querySelector('#toggle-theme #label')
    const oppositeTheme = newTheme == 'dark' ? 'light' : 'dark'
    label.textContent = `Enable ${oppositeTheme} mode`

    // Swap prism between light and dark themes
    // const prismLink = document.querySelector("head link[href*='prism']")
    // const newPrismStylesheet = newTheme == 'dark' ? 
    //   "prism-material-oceanic.css" : 
    //   "prism-duotone-light.css"
    // prismLink.setAttribute("href", `/styles/prism/${newPrismStylesheet}`)
  }


  /**
   * Set initial value on page load.
   * Create listener for system preference change.
   * Create listener for button click.
   */
  function setup() {
    /* ----- On page load ----- */

    // Get the current system-level preference.
    // By default we follow this, unless the user has
    // previously manually set a preference (see below).
    const systemPreferenceIsDark = window.matchMedia('(prefers-theme: dark)').matches

    // Has the user previously manually set a preference?
    // If yes, local storage will return 'light' or 'dark'
    // value. Else, it will be null.
    const userPreference = localStorage.getItem('user-theme-preference')

    // On page load, turn on dark theme if either...
    // 1) System preference is dark, and user user has not
    //    previously manually set a preference.
    // 2) User has manually set a preference for dark.
    const shouldSetDarkMode = systemPreferenceIsDark && !userPreference || userPreference == 'dark'

    if (shouldSetDarkMode) {
      setTheme('dark', false)
    } else {
      setTheme('light', false)
    }

    /* ----- On system preference change ----- */

    // On change to system preference, update accordingly,
    // but only if the user has not manually set a preference.
    if (!userPreference) {
      window.matchMedia('(prefers-theme: dark)').addEventListener('change', (e) => {
        if (e.matches) {
          setTheme('dark', false)
        } else {
          setTheme('light', false)
        }
      })
    }

    /* ----- On button click ----- */

    const button = document.querySelector('#toggle-theme')

    // Set the theme, and save the user's preference
    button.addEventListener('click', (e) => {
      const newTheme = document.body.dataset.theme == 'dark' ? 'light' : 'dark'
      setTheme(newTheme, true)
    })


    /* ----- On key press ----- */

    // Toggle theme on Alt-K key press
    window.addEventListener('keydown', (e) => {
      if (e.code == 'KeyT' && e.altKey) {
        const newTheme = document.body.dataset.theme == 'dark' ? 'light' : 'dark'
        setTheme(newTheme, true)
      }
    })
  }

  window.addEventListener('DOMContentLoaded', setup)
}(window, document))
