# Josh Carpenter Site

## Get started

Clone repo and run `npm install`

## Local development

(Optional) Fetch latest climate change notes from https://github.com/jcarpenter/climate-research:

`npm run fetch-climate-notes`

Build, serve, and watch for changes:

`npm run dev`

* `clean`: Remove `_site` directory
* `copy`:  Copy assets (e.g. third party JS, gifs, fonts)
* `sass:dev`: Outputs css to `_site/styles`
* `js:dev`: Copy JS to to `_site`
* `img`: Optimize SVGs, generate size variations of JPGs and PNGs, and move all to `_site/img`
* `html`: Run eleventy, then post-process it's output with `modify-html.js`, then beautify.
* `serve`: Start browsersync and watch for changes

### Deploy

* Push commits to `main` branch. 
* Netlify automatically sees the commi, run the `download-then-build` script, and push the results live.

## Climate Posts

* Write markdown file in Markdown, in climate-research repo.
* Export for publishing. Export step converts footnotes into spans (I think).
* Run `npm run fetch-climate-notes` in this repo to grab files.
* ...

## Footnotes

* In Markdown, wrap in marks, like `==my footnote text==`
* After Eleventy processes, `modify-html.js` is called.
* `modify-html.js` calls `footnotes-and-references.js`, which turns marks into footnotes (converts them to spans)


Tags