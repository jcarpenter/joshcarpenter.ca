module.exports = function (eleventyConfig) {

  const cheerio = require('cheerio')

  /* 

  Eleventy works by:
  
  1. Finds content files to process (convert to HTML). It calls these files "templates" (confusing name). We specify which file formats to treat as templates in `templateFormats`, in config options. I use .md (the format I write my posts in) and .njk (Nunjucks, the format I write my layouts (e.g. footer.njk) and stand-alone HTML files (e.g. index.njk) in.
  
  2. Processes templates with template engines. Nunjucks files are processed with Nunjucks engine (etc). Markdown files are special because they can optionally be pre-processed by a second template engine, before they're processed as Markdown. If, for example, we want to use Nunjucks markup inside our Markdown files, we could specify `markdownTemplateEngine: "njk"` in our config options. Per docs: https://www.11ty.dev/docs/languages/#special-case-pairing-a-templating-engine-with-md-markdown and https://www.11ty.dev/docs/config/#default-template-engine-for-markdown-files.
  
  3. Templates (content) are optionally wrapped in layouts. Layouts are "special templates that can be used to wrap other content". Per docs: https://www.11ty.dev/docs/layouts/. Layouts can be specified per the 11ty data cascade: https://www.11ty.dev/docs/data-cascade/. I specify the layout for posts using a Directory Data File (a file named posts.json, inside the posts/ directory). Per docs: https://www.11ty.dev/docs/data-template-dir/.
  
  4. Filters: Allow us to modify content inside the templates. For example, to modify a variable, or the `content`. Per https://www.11ty.dev/docs/filters/
  
  5. Transforms: Allow us to modify the template's out. Per https://www.11ty.dev/docs/config/#transforms.
  */  


  /* ==========================================================================
  CONFIGURATION
  ========================================================================== */

  let startEleventy = function () {

    return {

      // Specify which types of templates should be processed
      // https://www.11ty.dev/docs/config/#template-formats
      templateFormats: ["md", "njk"],

      // The template engine to pre-process markdown files.
      // Markdown files run through this template engine before transforming to HTML.
      // https://www.11ty.dev/docs/config/#default-template-engine-for-markdown-files
      markdownTemplateEngine: "md",

      // Directories
      dir: {
        // Top-level directory for templates. "." is default.
        input: "src",

        // Includes directory (files, partials, macros). These files are consumed by templates. Relative to input directory.
        includes: "includes",

        // Layouts directory. Relative to input directory.
        layouts: "layouts",

        // Global data files directory (data available to all templates). Relative to input directory.
        data: "data",

        // Top-level directory for output.
        output: "_site",

      }
    }
  }


  // -------- Enable Deep Data Merge -------- //
  // This feature allows additive tags (combine tags from multiple levels of the data cascade, instead of replacing them). It may have unintended side effects, however.
  // Per: https://www.11ty.dev/docs/data-deep-merge/
  // Per: https://www.11ty.dev/docs/data-cascade/

  eleventyConfig.setDataDeepMerge(true)


  // -------- Passthrough file copy -------- //
  // Copy files and directories to output directories
  // NOTE: I've switched to using gulp for this.


  // -------- Plugins -------- //
  // Custom code that Eleventy imports from an external repository

  const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")
  eleventyConfig.addPlugin(syntaxHighlight)


  // -------- Filters -------- //c
  // Called by template engines (e.g. nunjucks)

  // Return excerpts from content
  eleventyConfig.addFilter("excerpt", (content, label) => {

    if (!content) return

    console.log(content)

    const $ = cheerio.load(content)
    const excerpt = $(label)

    if (excerpt) {
      return excerpt
    } else {
      return
    }
  })

  // Format dates. Uses https://www.npmjs.com/package/nunjucks-date-filter
  const dateFilter = require("nunjucks-date-filter")
  eleventyConfig.addFilter("date", dateFilter)

  // // Add suffix to images. Important for responsive images.
  // // Per: https://jamesdoc.com/blog/2018/rwd-img-11ty/
  // eleventyConfig.addFilter("addImgSuffix", (imgStr, suffix) => {
  //   const i = imgStr.lastIndexOf('.')
  //   const name = imgStr.substring(0, i)
  //   let ext = imgStr.substring(i + 1)
  //   ext = "jpg" // Force to jpg
  //   return `${name}${suffix}.${ext}`
  // });


  // -------- Collections -------- //
  // Define custom collections

  // Make collections for certain tag combinations
  // 1) Sort alphabetically
  // 2) Filter out posts with specific tags (e.g. "hide")
  eleventyConfig.addCollection("climateImpacts", (collection) =>
    collection.getFilteredByTags('climate', 'problem')
      .sort((a, b) => {
        if (a.data.title > b.data.title) return 1
        else if (a.data.title < b.data.title) return -1
        else return 0
      })
      .filter(post => !post.data.tags.includes("hide"))
      .filter(post => !post.data.tags.includes("canada"))
  )

  eleventyConfig.addCollection("climateImpactsCanada", (collection) =>
    collection.getFilteredByTags('climate', 'problem', 'canada')
      .sort((a, b) => {
        if (a.data.title > b.data.title) return 1
        else if (a.data.title < b.data.title) return -1
        else return 0
      })
      .filter(post => !post.data.tags.includes("hide"))
  )

  eleventyConfig.addCollection("climateSolutions", (collection) =>
    collection.getFilteredByTags('climate', 'solution')
      .sort((a, b) => {
        if (a.data.title > b.data.title) return 1
        else if (a.data.title < b.data.title) return -1
        else return 0
      })
      .filter(post => !post.data.tags.includes("hide"))
  )

  eleventyConfig.addCollection("climateResiliency", (collection) =>
    collection.getFilteredByTags('climate', 'resiliency')
      .sort((a, b) => {
        if (a.data.title > b.data.title) return 1
        else if (a.data.title < b.data.title) return -1
        else return 0
      })
      .filter(post => !post.data.tags.includes("hide"))
  )

  eleventyConfig.addCollection("other", (collection) =>
    collection.getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => {
        if (a.data.title > b.data.title) return 1
        else if (a.data.title < b.data.title) return -1
        else return 0
      })
      .filter(post => !post.data.tags.includes("hide"))
      .filter(post => !post.data.tags.includes("climate"))
  )


  /* ==========================================================================
  MARKDOWN-IT
  ========================================================================== */

  // Here we configure markdown-it, the markdown parser used by 11ty.
  // https://github.com/markdown-it/markdown-it
  // Technically, we're specifying our own instance of markdown-it as 11ty's Markdown library. Per: https://www.11ty.dev/docs/languages/markdown/#optional-set-your-own-library-instance

  const markdownIt = require("markdown-it")

  // -------------- Configure markdown-it -------------- //

  let options = {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
    quotes: '“”‘’',
  }

  // -------------- Define markdown-it plugins -------------- //

  // Add footnote support. Both normal [^1] and ^[inline].
  // Repo: https://github.com/markdown-it/markdown-it-footnote
  // Original render functions: https://github.com/markdown-it/markdown-it-footnote/blob/master/index.js
  // Docs: https://github.com/markdown-it/markdown-it-footnote#customize
  // const markdownItFootnote = require("markdown-it-footnote")

  // Add sub and sup tag support
  // https://github.com/markdown-it/markdown-it-sup
  // https://github.com/markdown-it/markdown-it-sub
  const markdownItSup = require("markdown-it-sup")
  const markdownItSub = require("markdown-it-sub")

  // Add anchors to headers
  // https://github.com/valeriangalliat/markdown-it-anchor
  const markdownItAnchor = require("markdown-it-anchor")
  // We also add uslug to better prettify permalinks. Per docs:
  // https://github.com/valeriangalliat/markdown-it-anchor#unicode-support
  const uslug = require('uslug')
  const uslugify = s => uslug(s)
  // This is the HTML for an SVG icon (an anchor) which we'll use for the permalinkSymbol.
  // To prep the HTML for inclusion in JSON, I escape quotation marks and forward slashes in closing tags, and remove line breaks.
  // const svgAnchorIcon = "<svg width=\"16px\" height=\"16px\" viewBox=\"0 0 16 16\" version=\"1.1\" aria-hidden=\"true\"><g id=\"anchor\" transform=\"translate(-2.000000, 0.000000)\" fill=\"#000000\" fill-rule=\"nonzero\"><path d=\"M10.8786438,4.18224949 C12.466604,5.77185746 12.4448099,8.32040231 10.8882119,9.88563819 C10.8852883,9.88882756 10.8818332,9.89228271 10.8786438,9.89547208 L9.09259731,11.6815186 C7.51731492,13.256801 4.95441791,13.2565884 3.37937472,11.6815186 C1.80409233,10.106502 1.80409233,7.54331261 3.37937472,5.968296 L4.3655807,4.98209002 C4.62710894,4.72056178 5.07750096,4.89438238 5.09100262,5.26397706 C5.10822522,5.73499367 5.19269033,6.20821627 5.34854415,6.66519965 C5.40132821,6.8199372 5.36361392,6.99109999 5.2479993,7.1067146 L4.90017206,7.45454185 C4.15529498,8.19941892 4.13193286,9.41228271 4.86947439,10.1644422 C5.61429831,10.9240169 6.83853751,10.9285352 7.58907571,10.177997 L9.37512223,8.39221627 C10.1243847,7.64295381 10.1212485,6.43189733 9.37512223,5.68577108 C9.27675678,5.58759168 9.17767372,5.51131261 9.10027837,5.45802357 C8.98925642,5.38178482 8.92079766,5.25755983 8.9156405,5.12298038 C8.90511558,4.84212989 9.00462389,4.55272125 9.2265508,4.33079434 L9.78612555,3.77119301 C9.93286309,3.62445547 10.1630558,3.60643553 10.3332086,3.72518637 C10.5280707,3.86125268 10.7105859,4.01419652 10.8786438,4.18224949 Z\" id=\"Path\" transform=\"translate(7.130277, 8.255043) rotate(-315.000000) translate(-7.130277, -8.255043) \"></path><path d=\"M16.6338796,4.36963444 C15.0588364,2.79456467 12.4959394,2.79435205 10.920657,4.36963444 L9.13461049,6.15568095 C9.13142112,6.15887032 9.12796597,6.16232547 9.12504239,6.16551484 C7.56847096,7.73075072 7.54665036,10.2792956 9.13461049,11.8689035 C9.30265853,12.0369489 9.485165,12.189884 9.68001913,12.3259401 C9.85017195,12.4446909 10.0803912,12.4266444 10.2271022,12.2799334 L10.7866769,11.7203321 C11.0086038,11.4984052 11.1081122,11.2089966 11.0975872,10.9281461 C11.0924301,10.7935666 11.0239713,10.6693416 10.9129494,10.5931029 C10.835554,10.5398138 10.736471,10.4635348 10.6381055,10.3653554 C9.89197926,9.61922913 9.88884305,8.40817265 10.6381055,7.65891019 L12.424152,5.87312946 C13.1746902,5.12259125 14.3989029,5.12710952 15.1437533,5.88668428 C15.8812949,6.63884374 15.8579593,7.85170753 15.1130557,8.59658461 L14.7652284,8.94441185 C14.6496138,9.06002647 14.6118995,9.23118926 14.6646836,9.3859268 C14.8205374,9.84291019 14.9050025,10.3161328 14.9222251,10.7871494 C14.9357533,11.1567441 15.3861188,11.3305647 15.647647,11.0690364 L16.633853,10.0828305 C18.209162,8.50784042 18.209162,5.94465105 16.6338796,4.36963444 L16.6338796,4.36963444 Z\" id=\"Path\" transform=\"translate(12.882980, 7.796092) rotate(-315.000000) translate(-12.882980, -7.796092) \"></path><\/g><\/g><\/svg>"

  // Add block divs with `::: #warning`
  // https://github.com/kickscondor/markdown-it-div
  const markdownItDiv = require("markdown-it-div")

  // Add classes, identifiers and attributes with curly brackets. Eg: {.class #identifier attr=value}
  // https://github.com/arve0/markdown-it-attrs
  const markdownItAttrs = require("markdown-it-attrs")

  // Add spans with square brackets. Eg: paragraph with [a span]{.myClass}
  // https://github.com/mb21/markdown-it-bracketed-spans
  const markdownItBracketedSpans = require("markdown-it-bracketed-spans")

  // Render images occurring by itself in a paragraph as `<figure>< img ...></figure>`, similar to pandoc's implicit_figures
  // https://github.com/arve0/markdown-it-implicit-figures
  const markdownItImplicitFigures = require("markdown-it-implicit-figures")

  // Add marks with `==...===`
  // https://github.com/markdown-it/markdown-it-mark
  const markdownItMarks = require('markdown-it-mark')

  // Wrap header and children with sections
  // https://github.com/arve0/markdown-it-header-sections
  // const markdownItHeaderSections = require("markdown-it-header-sections")

  const markdownLib = markdownIt(options)
  markdownLib.use(markdownItSup)
    .use(markdownItSub)
    .use(markdownItAnchor, {
      level: [2, 3],
      slugify: uslugify,
      permalink: false,
      // permalinkSymbol: svgAnchorIcon,
    })
    .use(markdownItDiv)
    .use(markdownItMarks)
    .use(markdownItBracketedSpans)
    .use(markdownItAttrs)
    .use(markdownItImplicitFigures, {
      figcaption: true
    })


  // -------------- Customize markdown-it-footnote -------------- //

  // Docs: https://github.com/markdown-it/markdown-it-footnote#customize
  // Original: https://github.com/markdown-it/markdown-it-footnote/blob/master/index.js

  // markdownLib.renderer.rules.footnote_ref = function (tokens, idx, options, env, slf) {

  //   const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
  //   const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
  //   const refid = id;

  //   if (tokens[idx].meta.subId > 0) {
  //     refid += ':' + tokens[idx].meta.subId;
  //   }

  //   return `<a href="#fn${id}" id="fnref${refid}" aria-label="Footnote">${caption}</a>`;
  // }

  // -------------- Register markdown-it as library with 11ty -------------- //

  // This has to go after other Markdown-It configurations (IIUC)
  eleventyConfig.setLibrary("md", markdownLib)


  /* ==========================================================================
  TRANSFORMS TO OUTPUT
  ========================================================================== */

  // -------------- Beautify HTML -------------- //

  // Uses https://www.npmjs.com/package/pretty
  // const pretty = require("pretty")
  // eleventyConfig.addTransform("pretty", function (content, outputPath) {
  //   if (outputPath.endsWith(".html")) {
  //     let prettyHTML = pretty(content, { ocd: true })
  //     return prettyHTML
  //   }

  //   return content
  // })


  /* ==========================================================================
  4. RETURN THE CONFIGURED ELEVENTY OBJECT
  ========================================================================== */

  return startEleventy()

}