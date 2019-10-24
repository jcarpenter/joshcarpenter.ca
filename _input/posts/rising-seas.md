---
title: Workflow Test
date: 2019-10-21
---

## Testing Ulysses

Lorem ipsum dolor sit amet, consectetur ^[According to IPCC projections. [@wallace-wells2019]] adipiscing elit, sed do eiusmon tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. <i>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</i> Excepteur sint occaecat cupidatat non proident ^[Testing inline footnotes [@klein2018]], sunt in culpa qui officia deserunt mollit anim id est laborum. 

* Item 1
* Item 2
* Item 3

## Quotes

This paragraph contains an inline quote, "It was the best of times it was the blurst of times". Duis aute irure H~2~0 is a liquid ! Squared^2^ is dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

And this is a **blockquote**:

> This is a block quote that should flow over multiple lines. _Libero tempore_, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.

## Images and Figures

Image:

![The logo for Firefox](https://www.mozilla.org/media/img/logos/firefox/quantum/logo-word-hor-sm-high-res.d13d81356782.png "Alt text")&nbsp;

Figure with caption:

![The logo for Firefox](https://www.mozilla.org/media/img/logos/firefox/quantum/logo-word-hor-sm-high-res.d13d81356782.png "Alt text")

## Lists and Links

* Automatically generate citations and bibliography:
* Cite using pandoc citations format: [pandoc-citeproc](http://hackage.haskell.org/package/pandoc-citeproc)
* Style with [Citation Style Language](http://citationstyles.org/)
* Generate DB of citations in `Better BibLaTeX ` format from Zotero.
* Run pandoc

## Code

```javascript
var unified = require('unified')
var markdown = require('remark-parse')
var remark2rehype = require('remark-rehype')
var doc = require('rehype-document')
var format = require('rehype-format')
var html = require('rehype-stringify')
var report = require('vfile-reporter')

unified()
  .use(markdown)
  .use(remark2rehype)
  .use(doc, {title: '👋🌍'})
  .use(format)
  .use(html)
  .process('# Hello world!', function(err, file) {
    console.error(report(err || file))
    console.log(String(file))
  })
```