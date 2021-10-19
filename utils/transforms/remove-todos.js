const cheerio = require('cheerio')

const containsTodoRE = /TODO/

/**
 * Remove marks that contain TODOs
 * Also remove parent nodes made empty in process.
 */
module.exports = function removeTodos (content, outputPath) {
  
  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!outputPath) return content

  const $ = cheerio.load(content)
  const marks = $('mark')
  
  // For each mark found...
  // If mark contains a TODO, remove the mark
  // If mark contains a TODO, -and- is the only child of the parent 
  // (e.g. a <p> with only a TODO), remove the parent also.
  marks.each((index, mark) => {

    const text = $(mark).text()
    const containsTodo = containsTodoRE.test(text)
    if (containsTodo) $(mark).remove()

    //// Determine what to remove
    // const isOnlyChildOfParent = $(mark).parent().children().length == 1
    // if (containsTodo) { 
    //   if (isOnlyChildOfParent) {
    //     $(mark).parent().remove()
    //   } else {
    //     $(mark).remove()
    //   }
    // }
  })

  // Remove empty elements left when marks were removed
  // E.g. <p><mark>...</mark></p> --> <p></p>
  const empties = $('#post #content p:empty')
  empties.each((index, e) => $(e).remove())

  content = $.html()
  return content
}