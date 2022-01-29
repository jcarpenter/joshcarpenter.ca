/*
Handle setting light and dark color modes on the page.

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
   * @param {string} newScheme - 'dark' or 'light'
   * @param {boolean} wasSetManually 
   */
  function setScheme(newScheme, wasSetManually) {
    
    // Update body attribute 
    document.body.setAttribute('data-color-scheme', newScheme)
    
    // Save user preference using local storage
    if (wasSetManually) {
      localStorage.setItem('user-color-scheme-preference', newScheme);
    }

    // Update label
    const label = document.querySelector('#toggle-color-scheme #label')
    const oppositeScheme = newScheme == 'dark' ? 'light' : 'dark'
    label.textContent = `Enable ${oppositeScheme} mode`
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
    const systemPreferenceIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    // Has the user previously manually set a preference?
    // If yes, local storage will return 'light' or 'dark' 
    // value. Else, it will be null.
    const userPreference = localStorage.getItem('user-color-scheme-preference')
    
    // On page load, turn on dark scheme if either...
    // 1) System preference is dark, and user user has not 
    //    previously manually set a preference.
    // 2) User has manually set a preference for dark.
    const shouldSetDarkMode = systemPreferenceIsDark && !userPreference || userPreference == 'dark'

    if (shouldSetDarkMode) {
      setScheme('dark', false)
    }

    // Disable
    // document.querySelector('body').style.backgroundColor = "red !important"
    // document.body.style.backgroundColor = "red !important";
    // setTimeout(() => {console.log("this is the first message")}, 5000);


    /* ----- On system preference change ----- */

    // On change to system preference, update accordingly,
    // but only if the user has not manually set a preference.
    if (!userPreference) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (e.matches) {
          setScheme('dark', false)
        } else {
          setScheme('light', false)
        }
      })
    }
    
    /* ----- On button click ----- */

    const button = document.querySelector('#toggle-color-scheme')
    
    // Set the scheme, and save the user's preference
    button.addEventListener('click', (e) => {
      const newScheme = document.body.dataset.colorScheme == 'dark' ? 'light' : 'dark'
      setScheme(newScheme, true)
    })


    
  }

  window.addEventListener('DOMContentLoaded', setup)
  
}(window, document))
