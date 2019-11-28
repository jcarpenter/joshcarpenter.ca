(function (window, document) {
    'use strict'

    // function touchEnd(e) {
    //     console.log("touchend on TEST ITEM")
    // }

    // function touchLeave(e) {
    //     console.log("touchleave on TEST ITEM")
    // }

    // function touchCancel(e) {
    //     console.log("touchcancel on TEST ITEM")
    // }

    // function itemClick(e) {
    //     if (e.handled !== true) {
    //         e.handled = true
    //     } else {
    //         return false
    //     }
    //     console.log("click on TEST ITEM")
    // }

    function setupLinks() {

        //var test = document.querySelector('#testItem')
        //test.addEventListener("touchend", touchEnd, false); // Works
        //test.addEventListener("click", itemClick, false) // Works
        //test.addEventListener("touchleave", touchLeave, false);
        //test.addEventListener("touchcancel", touchCancel, false);

        var article = document.querySelector('article')
        var selected
        
        if (window.PointerEvent) {

            article.addEventListener('pointerdown', (e) => {
                if (e.pointerType == 'touch') {
                    
                    // console.log("article: touch detected")
                    
                    if (selected) {
                        // console.log("selected blurred")
                        selected.blur()
                        selected = null
                    }

                    if (e.target.tagName == "BUTTON") {
                        // console.log("button tapped")
                        selected = e.target
                    }
                }
            });
        }

        // article.addEventListener('touchend', touchEnd, false)

    }

    function touchEnd() {
        console.log("touch ended")
    }

    // Listen for taps on article.
    // Check if element tapped had tabindex value
    // If yes, save element to variable.

    // Listen for subequent taps on article.
    // Check if element tapped was the saved element.
    // If no, blur the saved element.

    //Fix once on first page load
    window.addEventListener('DOMContentLoaded', setupLinks)

}(window, document))