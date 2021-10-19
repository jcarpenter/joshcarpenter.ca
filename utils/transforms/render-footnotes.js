const cheerio = require('cheerio')

// Find citation keys, but ignore if they're inside an inline footnote.
// Demo: https://regex101.com/r/9pX25n/2
const citekeyNotInsideFootnoteRE = /(?<!\^\[[^\[\]]*)\[[^\[\]\(\)]*?-?@[a-z0-9_][a-z0-9_:.#$%&\-+?<>~/]*?.*?\]/gm

// Find citation keys in strings of text. Supports prefix, id, locator, suffix.
// Simple: [@timothy2019]
// Complex: [As written in @timothy2019, pp. 22-25, at least allegedly].
// Demo: https://regex101.com/r/LG0Ipi/1
const citekeyRE = /\[[^\[\]\(\)]*?-?@[a-z0-9_][a-z0-9_:.#$%&\-+?<>~/]*?.*?\](?!\()/gm

// Find components of cite keys (prefix, id, label, locator)
// Does not support suffic yet.
// Demo: https://regex101.com/r/TnsFFg/1
const citekeyComponentsRE = /(?<prefix>[^\n\[\]\(\)]*?)?@(?<id>[a-zA-Z0-9_][^\s,;\]]+)(?:,\s(?<label>[\D]+)\s?(?<locator>[\w-,:]+))?/

// Find inline footnotes.
// Extra complexity handles scenario with nested square brackets.
// E.g. ^[Text and [@meadows1998]]
// Demo: https://regex101.com/r/33mvVe/1
const footnotesRE = /\s?\^\[.*?\](?!.?\])/gm

module.exports = function renderFootnotes(content, outputPath) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!outputPath) return content

  const $ = cheerio.load(content)
  const paragraphs = $('#post #content p, #post #content li, #post #content figcaption')


  // Wrap citations in inline footnote markdown chararacters ^[...]
  // [@meadow2016] --> ^[[@meadow2016]]
  paragraphs.each((index, p) => {

    let html = $(p).html()

    html = html.replace(citekeyNotInsideFootnoteRE, (match, offset, string) => {
      return `^[${match}]`
    })

    $(p).html(html)
  })


  // After doing the above, check if there are any footnotes in the doc...
  // If yes, create a Notes section at the end. Else, exit.
  const post = $('#post #content').text()
  const containsFootnotes = footnotesRE.test(post)

  if (containsFootnotes) {

    // Append new "Notes" section at end of the document
    $('#post').append(`<section id="notes" aria-labelledby="notes-header" class="pattern-top-edge">
      <h2 id="notes-header">Notes</h2>
      <ol class="two-column-list"></ol>
    </section>`)
    // <ul class="two-column-list"></ul>

  } else {

    // Exit without modifications, if no footnotes are found...
    return content
  }


  // Copy each footnote to an <li> in Notes section...
  // And replace with a link to that <li>...

  const notesUl = $('article #notes > ol')
  let counter = 1

  // We keep a record of citation footnotes as we go,
  // so we can check it for duplicates.
  // let citationFootnotes = []

  paragraphs.each((index, p) => {

    let html = $(p).html()

    // Find footnotes
    let footnotes = html.match(footnotesRE)
    if (!footnotes) return true

    // For each footnote found...
    for (const footnote of footnotes) {

      let content = footnote.replace(/\s?\^\[/, '').slice(0, -1)

      // Move content into an <li> in the Notes section
      notesUl.append(`<li id="fn${counter}" class="fn-item" aria-label="Footnote">
      ${content}<a href="#fn-link-${counter}" class="fn-back" aria-label="Back to content">\u21a9\uFE0E</a>
      </li>\n`)

      // Replace text with link to the <li>
      html = html.replace(footnote, `&nbsp;<sup class="fn" id="fn-link-${counter}"><a href="#fn${counter}" class="fn-link" aria-label="Footnote" role="button" aria-expanded="false">${counter}</a></sup>`)

      counter++


      // // BELOW: OBSOLETE CODE FOR DE-DUPING CITATIONS
      // // Don't need, now that we're doing disambiguation (e.g. ibid) in citations processing.

      // // De-dupe citation footnotes
      // // If content contains a citation, check if a footnote already exists...
      // const contentContainsCitekey = citekeyRE.test(content)

      // if (contentContainsCitekey) {

      //   const citekey = content.match(citekeyRE)

      //   // Check if footnote with exact same content already exists
      //   const footnoteAlreadyExists = citationFootnotes.some((cf) => cf.string == citekey.toString())

      //   // If yes, link to it, instead of creating a new footnote.
      //   // Else, create a new footnote, and add a record to citationFootnotes
      //   if (footnoteAlreadyExists) {

      //     const { footnoteId } = citationFootnotes.find((cf) => cf.string == citekey.toString())

      //     html = html.replace(footnote, `<sup class="fn"><a href="#fn${counter}" id="fn-link-${counter}" class="fn-link" aria-label="Footnote" role="button" aria-expanded="false">${footnoteId}</a></sup>`)

      //   } else {

      //     // Trim square brackets off citation key
      //     // [@meadows20] --> @meadows20
      //     // content = content.slice(1, -1)

      //     // Get citekey components
      //     let { prefix = undefined, id = '', label = '', locator = '' } = citekey.toString().match(citekeyComponentsRE)?.groups

      //     // Move content into an <li> in the Notes section
      //     notesUl.append(`<li id="fn${counter}" class="fn-item" aria-label="Footnote">
      //       ${content}
      //       <a href="#fn-link-${counter}" class="fn-back" aria-label="Back to content">\u21a9\uFE0E</a>
      //     </li>\n`)

      //     html = html.replace(footnote, `<sup class="fn"><a href="#fn${counter}" id="fn-link-${counter}" class="fn-link" aria-label="Footnote" role="button" aria-expanded="false">${counter}</a></sup>`)

      //     citationFootnotes.push({
      //       string: citekey.toString(),
      //       prefix,
      //       id,
      //       label,
      //       locator,
      //       footnoteId: counter
      //     })

      //     counter++
      //   }
      // } else {

      //   // Else, create new (non-citation) footnote

      //   // Move content into an <li> in the Notes section
      //   notesUl.append(`<li id="fn${counter}" class="fn-item" aria-label="Footnote">
      //     ${content}
      //     <a href="#fn-link-${counter}" class="fn-back" aria-label="Back to content">\u21a9\uFE0E</a>
      //   </li>\n`)

      //   // Replace text with link to the <li>
      //   html = html.replace(footnote, `<sup class="fn"><a href="#fn${counter}" id="fn-link-${counter}" class="fn-link" aria-label="Footnote" role="button" aria-expanded="false">${counter}</a></sup>`)

      //   counter++
      // }

    }

    $(p).html(html)

  })

  // Add popup-footnotes.js to the head
  $('head').append('<script src="/js/popup-footnotes.js"></script>')

  content = $.html()
  return content
}