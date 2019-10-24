const Cite = require('citation-js')
const fs = require('fs');


module.exports = function (eleventyConfig) {

    // -------- PASSTHROUGH FILE COPY -------- //
    // Copy css and img directories to output directory
    eleventyConfig.addPassthroughCopy("src/styles")
    eleventyConfig.addPassthroughCopy("src/posts/img")


    // -------- TEMPLATE LANGUAGE FILTERS -------- //
    // Called from template engines

    // Format dates. Uses https://www.npmjs.com/package/nunjucks-date-filter
    const dateFilter = require("nunjucks-date-filter")
    eleventyConfig.addFilter("date", dateFilter)


    // -------- CITATION-JS -------- //

    // Load references from file. My references are in CSL-JSON format.
    const references = fs.readFileSync('src/references/climate-references.json', 'utf8')

    // Input references into new Cite()
    const cite = new Cite(references)

    // Load custom CSL from file, and add to plugins.config so we can access it later.
    const stylesName = 'josh-csl'
    const styles = fs.readFileSync('src/references/climate-CSL-styles.csl', 'ascii')
    Cite.plugins.config.get('@csl').templates.add(stylesName, styles)


    // -------- MARKDOWN-IT -------- //
    const markdownIt = require("markdown-it")
    const markdownItFootnote = require("markdown-it-footnote") // Uses Pandoc formating
    const markdownItSup = require("markdown-it-sup")
    const markdownItSub = require("markdown-it-sub")
    const markdownItAnchor = require("markdown-it-anchor")
    const markdownItHeaderSections = require("markdown-it-header-sections")
    const markdownItImplicitFigures = require("markdown-it-implicit-figures")

    let options = {
        html: true,
        breaks: true,
        linkify: true,
        typographer: true,
        quotes: '“”‘’',
    }

    const markdownLib = markdownIt(options)
    markdownLib.use(markdownItFootnote)
        .use(markdownItSup)
        .use(markdownItSub)
        .use(markdownItAnchor)
        .use(markdownItHeaderSections)
        .use(markdownItImplicitFigures, {
            figcaption: true
        })

    /* 
    Hacky fix for image paths being broken by permalinks. I used permalinks, which 
    creates parent directories for posts. This changes the relative path to images in 
    said posts, after processing. This Markdown-It rule fixes the paths.
    
    This is currently *brittle*, because it relies on convention. If I change 1) where 
    `img` directory lives in either my working or output directories, or 2) my permalink
    nesting depths, this will break. 
    */
    const defaultImageRule = markdownLib.renderer.rules.image
    markdownLib.renderer.rules.image = function (tokens, idx, options, env, self) {

        let imgToken = tokens[idx]
        let oldPath = imgToken.attrGet('src')
        let newPath = '../' + oldPath // Add one more level of relative path nesting
        
        imgToken.attrSet('src', newPath)
        
        return defaultImageRule(tokens, idx, options, env, self)
    }

    eleventyConfig.setLibrary("md", markdownLib)


    // -------- TRANSFORMS -------- //    
    // Modify a template’s output

    // Insert citations
    eleventyConfig.addTransform("", function (content, outputPath) {

        if (outputPath.endsWith(".html")) {

            // Find citekeys with regex for [@authorYear]
            let citekey = content.match(/(\[@\w\S+\d\d\d\d\])/g)

            if (citekey) {
                citekey.forEach(function (c) {

                    // Get the ID by trimming square brackets and @ symbol.
                    // Before: [@jones2019] After: jones2019.
                    // Regex test: https://regex101.com/r/j0Ml9U/1
                    let id = c.replace(/[\[\@\]]/g, '')

                    // Get our citation(s). We use options to customize the returned data.  `format` specifies the format of the returned citation. `template` specifies the CSL style we want to use. `entry` array specifies which we want, by id.
                    let citation = cite.format('citation', {
                        format: 'html',
                        template: stylesName,
                        lang: 'en-US',
                        entry: [id]
                    })

                    // Find author, and replace underline text decoration with class
                    citation = citation.replace('style="text-decoration:underline;"', 'class="cite-author"')

                    // Find container, and replace <i> with span and class
                    citation = citation.replace('<b>', '<span class="cite-container">')
                    citation = citation.replace('</b>', '</span>')

                    // Find URL, if it exists
                    // Regex from: http://www.regexguru.com/2008/11/detecting-urls-in-a-block-of-text/
                    let url = citation.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm)

                    // Find title and replace with link and span, or just span
                    if (url) {

                        // url is an array. The first value is always the url string we need.
                        url = url[0]

                        // Remove URL from citation text
                        citation = citation.replace(url, '')

                        // Replace italic text with link and use url variable as href
                        citation = citation.replace('<i>', '<span class="title"><a href=\"' + url + '\">')
                        citation = citation.replace('</i>', '</a></span>')
                    } else {

                        citation = citation.replace('<i>', '<span class="cite-title">')
                        citation = citation.replace('</i>', '</span>')
                    }

                    // Wrap whole citation in <cite> element
                    citation = '<cite>' + citation + '</cite>'

                    // Finally, replace the citekey with our nicely formatted citation
                    content = content.replace(c, citation)

                    // console.log(citation)
                })
            }
        }

        return content
    })

    // Beautify HTML
    const pretty = require("pretty");

    eleventyConfig.addTransform("pretty", function (content, outputPath) {
        if (outputPath.endsWith(".html")) {
            let prettyHTML = pretty(content, { ocd: true });
            return prettyHTML;
        }

        return content;
    });


    // -------- CONFIG OPTIONS -------- //
    return {

        // Template engines
        markdownTemplateEngine: "njk", // Defualt
        htmlTemplateEngine: "liquid", // Defualt

        // Template formats to transform. https://www.11ty.io/docs/config/#template-formats
        templateFormats: ["md", "liquid"],

        // Directories
        dir: {
            // Top-level directory for templates. "." is default.
            input: "src",

            // Includes directory (files, partials, macros). Relative to input directory. These files are consumed by templates.
            includes: "includes",

            // Layouts directory. Relative to input directory.
            layouts: "layouts",

            // Global data files directory (data available to all templates). Relative to input directory.
            data: "data",

            // Output director
            output: "_site",
        }
    }
}