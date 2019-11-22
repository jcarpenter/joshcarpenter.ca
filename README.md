# Josh Carpenter Site

## Get started

Clone repo and run `npm install`

## Develop

### Pull down latest posts and then serve and watch for changes

`npm run download-posts && npx @11ty/eleventy --serve`

### Deploy

* Push an update to main branch. 
* Netlify will automatically see the push, run the `download-then-build` script, and push the results live.
