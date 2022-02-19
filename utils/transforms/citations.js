const cheerio = require('cheerio')
const CSL = require('citeproc')
const fs = require("fs")
const getCitationLocatorLabels = require("../get-citation-locator-labels")
const path = require("path")


// Find citation keys in strings of text. Supports prefix, id, locator, suffix.
// Simple: [@timothy2019]
// Complex: [As written in @timothy2019, pp. 22-25, at least allegedly].
// Demo: https://regex101.com/r/LG0Ipi/1
const citekeyRE = /\[[^\[\]\(\)]*?-?@[a-z0-9_][a-z0-9_:.#$%&\-+?<>~/]*?.*?\](?!\()/gm

// Find components of cite keys (prefix, id, label, locator)
// Does not support suffic yet.
// Demo: https://regex101.com/r/TnsFFg/1
const citekeyComponentsRE = /(?<prefix>[^\n\[\]\(\)]*?)?@(?<id>[a-zA-Z0-9_][^\s,;\]]+)(?:,\s(?<label>[\D]+)\s?(?<locator>[\w-,:]+))?/


function makeCiteprocEngine() {

  const style = fs.readFileSync('./src/citations/climate-CSL-styles.csl', 'utf8')
  const locale = fs.readFileSync('./src/citations/locales-en-US.xml', 'utf8')

  const engine = new CSL.Engine(sys = {

    // We'll populate this with citable items
    items: {},

    // An array of valid locator labels. Each formatted as follows:
    // {
    //   term: "p.",
    //   form: "short",
    //   plural: "single",
    //   parentTerm: "page"
    // }
    locatorLabels: getCitationLocatorLabels(locale),

    // Given a language tag in RFC-4646 form, this method retrieves the
    // locale definition file.  This method must return a valid *serialized*
    // CSL locale. (In other words, an blob of XML as an unparsed string.  The
    // processor will fail on a native XML object or buffer).
    retrieveLocale: () => locale,

    // Given an identifier, this retrieves one citation item.  This method
    // must return a valid CSL-JSON object.
    retrieveItem: (id) => {
      return this.sys.items[id]
    }
  }, style)

  return engine
}

let citeproc

module.exports = function (content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  const $ = cheerio.load(content)
  
  // Get bibliography path. Exit if none is defined.
  // It's set as data-attribute on body
  // NOTE: We'd prefer to get it from elevent data, but transforms
  // do not have access to data :p
  let bibliography = $('body').attr('data-bibliography')
  if (!bibliography) return content
  // Bibliography paths specified in data files are relative
  // If we specify `bibliography: "./climate.json"` in a directory data file at /src/notes/notes.json, we expect to find climate.json in that same /src/notes folder.
  bibliography = path.resolve(path.dirname(this.inputPath), bibliography)
  // Cleanup: Remove the attribute. We don't want it in shipped HTML.
  $('body').removeAttr('data-bibliography')
  
  // Exit if bibliography is missing
  if (!fs.existsSync(bibliography)) return content

  // Setup citeproc engine the first time through
  if (!citeproc) citeproc = makeCiteprocEngine()

  // Load bibliography (list of CSL "items")
  // Per https://citeproc-js.readthedocs.io/en/latest/csl-json/markup.html
  const arrayOfItems = JSON.parse(fs.readFileSync(bibliography, 'utf8'))
  arrayOfItems.forEach((item) => citeproc.sys.items[item.id] = item)
  citeproc.updateItems(Object.keys(citeproc.sys.items))

  // Look inside each footnote <li>

  const footnotes = $('#footnotes li')

  footnotes.each((index, p) => {

    let html = $(p).html()

    // Find cite keys in text
    let citekeys = html.match(citekeyRE)
    if (!citekeys) return true

    // For each citekey, replace it with the rendered
    // html from citeproc.
    for (let citekey of citekeys) {

      // Get citekey components (prefix, id, etc)
      // Groups return as "According to", "@dole2012", "pp.", "3-4"
      // First use slice to remove enclosing square brackets
      // [@tim2020] --> tim2020
      let {
        prefix = undefined,
        id = '',
        label = '',
        locator = ''
      } = citekey.slice(1, citekey.length - 1).match(citekeyComponentsRE)?.groups

      if (label) {

        // If label is present, we need to get the full parent term name, 
        // E.g. the parent term name of "pp." is "page"
        // Citeproc only accepts parent term names (which is annoying)

        // There might be multiple qualifying parent labels. E.g. "page" and "pages" will
        // both return for "@marlee98 page 22". This will usually be because the singular is 
        // subset of the plural, so in these cases, match the plural.
        // Else, if there's only one match, use it.
        const matchingLabels = citeproc.sys.locatorLabels.filter(({ term }) => label.includes(term))
        label = matchingLabels.length > 1 ?
          matchingLabels.find((m) => m.plural).parentTerm :
          matchingLabels[0].parentTerm
      }

      // Remove ugly timestamp locator labels
      // t. 19:31 -> 19.31
      // Demo: https://regex101.com/r/Uh1KAd/2/
      if (label) label = label.replace(/(t\.|tt\.|times|time)\s?/, '')

      let rendered = citeproc.previewCitationCluster({
        citationItems: [{
          prefix,
          id,
          label,
          locator
        }],
        properties: {
          noteIndex: 0
        }
      }, [], [], 'text')
      
      // Update citationsPre and increment noteIndex
      
      // Per https://citeproc-js.readthedocs.io/en/latest/running.html?highlight=previewCitationCluster#processcitationcluster
      // "array of one or more index/string pairs, one for each citation affected by the citation edit or insertion operation"
      // const affectedCitations = rendered[1]
      // let renderedCitationHtml = affectedCitations[affectedCitations.length-1][1]
      // Replace numeric code characters with regular characters
      // renderedCitationHtml = renderedCitationHtml.replaceAll('&#60;', '<').replaceAll('&#62;', '>')

      // citationsPre.push([citationID, citationIndex])
      // citationIndex++

      // Replace citekey with hydrated citation
      html = html.replace(citekey, rendered)
    }

    
    // Replace the original html with the updated version
    $(p).html(html)
    
  })

  // From citekey, determine:
  // id - E.g. winston2016
  // locator label - E.g. "page"
  // locator value - E.g. "216-218"

  content = $.html()
  return content
}
