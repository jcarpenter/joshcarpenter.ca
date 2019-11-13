const Cite = require('citation-js')
const fs = require('fs')
const getUrls = require('get-urls')

module.exports = function (eleventyConfig) {


    // -------- PASSTHROUGH FILE COPY -------- //
    // Copy css and img directories to output directory
    eleventyConfig.addPassthroughCopy("src/styles/fonts")
    eleventyConfig.addPassthroughCopy("src/posts/img")
    eleventyConfig.addPassthroughCopy("src/js")


    // -------- TEMPLATE LANGUAGE FILTERS -------- //
    // Called from template engines

    // Format dates. Uses https://www.npmjs.com/package/nunjucks-date-filter
    const dateFilter = require("nunjucks-date-filter")
    eleventyConfig.addFilter("date", dateFilter)


    // -------- MARKDOWN-IT -------- //
    const markdownIt = require("markdown-it")
    const markdownItFootnote = require("markdown-it-footnote") // Uses Pandoc formating
    const markdownItSup = require("markdown-it-sup")
    const markdownItSub = require("markdown-it-sub")
    const markdownItAnchor = require("markdown-it-anchor")
    const markdownItAttrs = require("markdown-it-attrs")
    const markdownItBracketedSpans = require("markdown-it-bracketed-spans")
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
    markdownLib.use(markdownItSup)
        .use(markdownItSub)
        .use(markdownItFootnote)
        .use(markdownItAnchor)
        .use(markdownItAttrs)
        .use(markdownItBracketedSpans)
        // .use(markdownItHeaderSections)
        .use(markdownItImplicitFigures, {
            figcaption: true
        })

    // Customize footnotes
    // These override original markdown-it-footnote rules.
    // Originals: https://github.com/markdown-it/markdown-it-footnote/blob/master/index.js
    // Docs: https://github.com/markdown-it/markdown-it-footnote#customize
    
    // Remove square brackets from link text
    markdownLib.renderer.rules.footnote_caption = function (tokens, idx) {

        let n = Number(tokens[idx].meta.id + 1).toString()

        if (tokens[idx].meta.subId > 0) {
            n += ':' + tokens[idx].meta.subId
        }

        return n
    }

    // Use anchors + spans for links, instead of other way around.
    markdownLib.renderer.rules.footnote_ref = function (tokens, idx, options, env, slf) {
        let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
        let caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
        let refid = id;

        if (tokens[idx].meta.subId > 0) {
            refid += ':' + tokens[idx].meta.subId;
        }

        return '<a href="#fn' + id + '" class="footnote-ref" id="fnref' + refid + '"><span>' + caption + '</span></a>';
    }

    // Start footnotes section with footer and h2, instead of hr
    markdownLib.renderer.rules.footnote_block_open = function () {
        return '<footer id="footnotes">\n' + '<h2>Notes</h2>\n' + '<ol>\n'
    }

    markdownLib.renderer.rules.footnote_block_close = function () {
        return '</ol>\n</footer>\n';
    }

    /* 
    Hacky fix for image paths being broken by permalinks. I use permalinks, which creates parent directories for posts. This changes the relative path to images in said posts, after processing. This Markdown-It rule fixes the paths. WARNING: This solution is *brittle*, because it relies on convention. If I change 1) where `img` directory lives in either my working or output directories, or 2) my permalink nesting depths, this will break. 
    */
    const defaultImageRule = markdownLib.renderer.rules.image
    markdownLib.renderer.rules.image = function (tokens, idx, options, env, self) {

        let imgToken = tokens[idx]
        let oldPath = imgToken.attrGet('src')
        let newPath = '../' + oldPath // Add one more level of relative path nesting

        imgToken.attrSet('src', newPath)

        return defaultImageRule(tokens, idx, options, env, self)
    }

    // This has to go after other Markdown-It configurations (IIUC)
    eleventyConfig.setLibrary("md", markdownLib)


    // -------- TRANSFORMS -------- //    
    // Modify a template’s output

    // Insert citations
    // eleventyConfig.addTransform("insert-citations", function (content, outputPath) {

    //     if (outputPath.endsWith(".html")) {

    //         // Find citekeys with regex
    //         // Demo: https://regex101.com/r/r0Z2tJ/1
    //         let citekey = content.match(/\[@(.*?)\]/gm)

    //         if (citekey) {
                
    //             // Load references from file. My references are in CSL-JSON format.
    //             const references = require('./src/references/climate-references.json')

    //             // Load custom CSL from file, and add to plugins.config so we can access it later.
    //             const stylesName = 'josh-csl'
    //             const styles = fs.readFileSync('./src/references/climate-CSL-styles.csl', 'ascii')
    //             Cite.plugins.config.get('@csl').templates.add(stylesName, styles)

    //             citekey.forEach(function (c) {

    //                 let citation

    //                 // Only process citations if environment variables is set 'true'                    
    //                 if (process.env.PROCESS_CITATIONS == 'false') {
    //                     content.replace(c, '')
    //                     return
    //                 }

    //                 // Instantiate these strings. We'll clean them up below.
    //                 let id = c
    //                 let locator = c.match(/(\,.*?\])/gm)

    //                 if (locator) {
    //                     locator = locator[0].replace(/(,\s\w\W)/gm, '') // Strip down to just digits
    //                     locator = locator.replace(/\]/gm, '') // Strip down to just digits (remove right bracket)
    //                     id = c.replace(/(\,.*?\])/gm, '') // Remove the locator from the id
    //                 }

    //                 // Get the ID by trimming square brackets and @ symbol.
    //                 // Before: [@jones2019]. After: jones2019.
    //                 // Regex test: https://regex101.com/r/j0Ml9U/1
    //                 id = id.replace(/[\[\@\]]/g, '')

    //                 // Get citation:
    //                 // `format`: the format of the returned citation.
    //                 // `template`: specifies the CSL style we want to use. 
    //                 // Docs: https://citation.js.org/api/tutorial-output_formats.html
    //                 for (let i = 0; i < references.length; i++) {

    //                     if (references[i].id == id) {
                            
    //                         let data = references[i]
    //                         let citeproc = new Cite(data)
                            
    //                         citation = citeproc.format('citation', {
    //                             template: stylesName,
    //                             format: 'html',
    //                             lang: 'en-US'
    //                         })
    //                     }
    //                 }

    //                 // let citation = "Richard Alley National Climate Seminar Excerpt. Bard Center for Environmental Policy. https://vimeo.com/292991175 Recorded 19 Sep 2018. 40:00."

    //                 // Find author, and replace underline text decoration with class
    //                 citation = citation.replace('style="text-decoration:underline;"', 'class="cite-author"')

    //                 // Find container, and replace <i> with span and class
    //                 citation = citation.replace('<b>', '<span class="cite-container">')
    //                 citation = citation.replace('</b>', '</span>')

    //                 // Find all URLs in the citation string (should be only one), as a Set.
    //                 // Options are there to disable alterations that `get-urls` package 
    //                 // makes by default to the URLs as they're retrieved. We need to match
    //                 // the unaltered original from the source text, so we can replace() it. 
    //                 // Details here: https://www.npmjs.com/package/get-urls
    //                 let urls = getUrls(citation, { sortQueryParameters: false, removeTrailingSlash: false, removeQueryParameters: false, stripWWW: false, stripAuthentication: false, normalizeProtocol: false })

    //                 // Find title and replace with link and span, or just span
    //                 // If url was found, use it to make the title a link
    //                 if (urls) {

    //                     // urls is a Set. I used code found below to get the first entry.
    //                     // https://www.geeksforgeeks.org/sets-in-javascript/
    //                     let url = urls.entries().next().value[0]

    //                     // Remove URL from citation text
    //                     citation = citation.replace(url, '')

    //                     // Replace italic text with link and use url variable as href
    //                     citation = citation.replace('<i>', '<a href="' + url + '" class="cite-title">')
    //                     citation = citation.replace('</i>', '</a>')
    //                 } else {
    //                     citation = citation.replace('<i>', '<span class="cite-title">')
    //                     citation = citation.replace('</i>', '</span>')
    //                 }

    //                 if (locator) {
    //                     citation = citation + '<span class="cite-locator">' + locator + '. </span>'
    //                 }

    //                 // Wrap whole citation in <cite> element
    //                 // citation = '<cite>' + citation + '</cite>'

    //                 // Finally, replace the citekey with our nicely formatted citation
    //                 content = content.replace(c, citation)

    //             })
    //         }
    //     }

    //     return content
    // })

    // Strip extra space before footnote links
    eleventyConfig.addTransform("strip-spaces-before-footnote-links", function (content, outputPath) {
        if (outputPath.endsWith(".html")) {
            content = content.replace(/ <a href="#fn/gm, '<a href="#fn')
        }

        return content
    })

    // Clean citation URLs from pandoc-citeproc
    // eleventyConfig.addTransform("clean-citation-urls", function (content, outputPath) {
    //     if (outputPath.endsWith(".html")) {
    //         content = content.replace(/(\(<)/gm, '(')
    //         content = content.replace(/(>\))/gm, ')')
    //     }

    //     return content
    // })

    // Hang quotes
    // Check if first character
    eleventyConfig.addTransform("hang-quotes", function (content, outputPath) {
        if (outputPath.endsWith(".html")) {
            content = content.replace(/(<p>“)/gm, '<p class="hanging-punctuation">“')
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
    })


    // -------- CONFIG OPTIONS -------- //
    return {

        // Template engines
        markdownTemplateEngine: "njk", // Defualt
        htmlTemplateEngine: "njk", // Defualt

        // Template formats to transform. https://www.11ty.io/docs/config/#template-formats
        templateFormats: ["md", "njk"],

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