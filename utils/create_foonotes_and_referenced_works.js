const cheerio = require('cheerio')

/**
 * If there are any footnotes, create footnotes section.
 * If any of the footnotes contain `class="citation"`, create references section.
 */
module.exports = (content) => {

  const $ = cheerio.load(content)
  const post_body = $('#post-body')
  const marks = $('#post-body mark')
  const citations = $('#post-body mark .citation')

  const footnotes_open = `<section id="footnotes" aria-labelledby="footnotes-header" class="thick-border hidden"><h2 id="footnotes-header">Footnotes</h2><ol class="two-column-list">`
  const footnotes_close = `</ol></section>`

  const references_open = `<section id="references" aria-labelledby="references-header" class="thick-border"><h2 id="references-header">Referenced works</h2><ul class="two-column-list">`
  const references_close = `</ul></section>`

  let index = 1
  let footnotes_list = ''
  let references_list = ''

  if (marks.length == 0) return content

  marks.each(function () {

    const mark = $(this)
    const mark_contents = mark.html()
    const link_to_fn = `<a href="#fn${index}" id="fn-link-${index}" class="fn-link" aria-label="Footnote">${index}</a>`
    const link_back = `<a href="#fn-link-${index}" class="fn-back" aria-label="Back to content">\u21a9\uFE0E</a>`
    const list_item = `<li id="fn${index}" class="fn-item" aria-label="Footnote">${mark_contents} ${link_back}</li>`

    // Add <li> with mark contents
    footnotes_list += `${list_item}`

    //  Replace original mark with link to footnote
    mark.replaceWith(link_to_fn)

    index++
  })

  const footnotes_section = `${footnotes_open}${footnotes_list}${footnotes_close}`
  post_body.after(footnotes_section)

  if (citations.length > 0) {

    citations.each(function () {

      const citation = $(this)
      const title = citation.find('.cite-title')

      if (!references_list.includes(title)) {
        citation.find('.cite-locator').remove()
        const list_item = `<li class="ref-item" aria-label="Referenced work">${citation}</li>`
        references_list += list_item
      }
    })

    const references_section = `${references_open}${references_list}${references_close}`
    $('#footnotes').after(references_section)
  }

  // // Add aria info to individual references:
  // const refs = $('#references li')
  // if (refs) {
  //   refs.each(function () {

  //     let ref = $(this)
  //     ref.attr('class', 'ref-item')
  //     ref.attr('aria-label', 'Referenced work')

  //     // NOTE 4/8: Not going to do the following, as DPub roles are meant for eBooks
  //     // ref.attr('aria-role', 'doc-biblioentry')
  //   })
  // }

  content = $.html()
  return content
}