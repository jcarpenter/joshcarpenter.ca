const cheerio = require('cheerio')

/**
 * TODO: I'll have to come back to this.
 * I'm having trouble figuring out how to find abbreviation terms in text nodes, using Cheerio's jQuery interface. I can set html() of nodes, and I can filter to text nodes only, but I can't figure out how to set html() of text nodes (and ignore links, already-wrapped elements, etc).
 */
const abbreviationsRE = [/IPCC/, /RCP/, /AR5/, /RCP2.6/, /RCP4.5/, /RCP6.0/, /RCP8.5/, /GMSL/, /IAEA/, /NASA/, /NOAA/, /CAD/, /USD/]

module.exports = function (content, outputPath) {
  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!outputPath) return content
  
  // Exit early for non-climate posts
  const isClimatePost = this.dataCache.tags?.includes('climate')
  if (!isClimatePost || !outputPath.includes('nuclear')) return content
  
  const $ = cheerio.load(content)

  // 10/18: Second attempt. 
  // Tried filtering to only text nodes. Works,
  // but then I can't figure out how to replace their contents
  // with text that now includes html (abbreviation string
  // wrapped in <abbr>.
  
  // const test = $(`#post #content p`).contents().filter(function() {return this.nodeType == 3})
  // test.each((i, t) => {
    //// Doesn't work: can't set html() on text node, it seems.
    // const newHtml = $(t).html().replace(/(IPCC)/g, '<abbr>$1</abbr>')
    // $(t).html(newHtml)
  // })
  // content = $.html()
  // return content
  

  // 10/18: First attempt...
  
  // const searchables = $(`
  //   #post #content p
  // `)
  // searchables.each((index, s) => {

  //   // console.log($(s).text())
  //   const newHtml = $(s).html().replace(/Tide_gauge/g, '<abbr>Booger</abbr>')
  //   // $(s).html(newHtml)
  //   // console.log(s)

  //   // $(s).contents().filter(function() {return this.nodeType === 3}).html('<abbr>Hi there</abbr>')
  //   // console.log(textNodes)
  //   // if (textNodes) {
  //     // textNodes.each((i, t) => console.log($(t).text()))
  //   // }

  //   // const text = $(s).text()
  //   // const textContainsAbbr = abbreviationsRE.some((a) => a.test(text))
  //   // if (textContainsAbbr) {
  //   //   const newHTML = $(s).html().replace(/(IPCC)/g, '<abbr>$1</abbr>')
  //   //   $(s).html(newHTML)
  //   // }
  // })

  content = $.html()
  return content

}