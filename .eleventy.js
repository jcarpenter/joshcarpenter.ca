const cheerio = require('cheerio')
const path = require('path')
const fs = require("fs")

// Markdown-it
const MarkdownIt = require("markdown-it")
const markdownItAnchor = require("markdown-it-anchor")
const markdownItAttrs = require("markdown-it-attrs")
const markdownItBracketedSpans = require("markdown-it-bracketed-spans")
const markdownItDiv = require("markdown-it-div")
const markdownItImplicitFigures = require("markdown-it-implicit-figures")
const markdownItMarks = require("markdown-it-mark")
const markdownItSub = require("markdown-it-sub")
const markdownItSup = require("markdown-it-sup")

// Plugins
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")

// Filters
const dateFilter = require("nunjucks-date-filter")
const slugify = require("slugify")

// Transforms
const generateImages = require('./utils/transforms/generate-images')
const hangingPunctuation = require('./utils/transforms/hanging-punctuation')
const modifyIframes = require('./utils/transforms/modify-iframes')
const makeVideos = require('./utils/transforms/make-videos')
const modifyFigures = require('./utils/transforms/modify-figures')
const prettierHtml = require('./utils/transforms/prettier-html')
const removeTodos = require('./utils/transforms/remove-todos')
const renderCitations = require('./utils/transforms/render-citations')
const renderFootnotes = require('./utils/transforms/render-footnotes')
const setMetaTags = require('./utils/transforms/set-metatags')
const flagShortPosts = require('./utils/transforms/flag-short-posts')
// const tagAbbreviations = require('./utils/transforms/tag-abbreviations')



module.exports = function (eleventyConfig) {

  /* 

  Eleventy works by:
  
  1. Finds content files to process (convert to HTML). It calls these files "templates" (confusing name). We specify which file formats to treat as templates in `templateFormats`, in config options. I use .md (the format I write my posts in) and .njk (Nunjucks, the format I write my layouts (e.g. footer.njk) and stand-alone HTML files (e.g. index.njk) in.
  
  2. Processes templates with template engines. Nunjucks files are processed with Nunjucks engine (etc). Markdown files are special because they can optionally be pre-processed by a second template engine, before they're processed as Markdown. If, for example, we want to use Nunjucks markup inside our Markdown files, we could specify `markdownTemplateEngine: "njk"` in our config options. Per docs: https://www.11ty.dev/docs/languages/#special-case-pairing-a-templating-engine-with-md-markdown and https://www.11ty.dev/docs/config/#default-template-engine-for-markdown-files.
  
  3. Templates (content) are optionally wrapped in layouts. Layouts  are "special templates that can be used to wrap other content". Per docs: https://www.11ty.dev/docs/layouts/. Layouts can be specified per the 11ty data cascade: https://www.11ty.dev/docs/data-cascade/. I specify the layout for posts using a Directory Data File (a file named posts.json, inside the posts/ directory). Per docs: https://www.11ty.dev/docs/data-template-dir/.
  
  4. Filters: Allow us to modify content inside the templates. For example, to modify a variable, or the `content`. Per https://www.11ty.dev/docs/filters/
  
  5. Transforms: Allow us to modify the template's out. Per https://www.11ty.dev/docs/config/#transforms.
  */  


  // ========================================================
  // BEFORE BUILD
  // ========================================================

  // let citeproc

  // eleventyConfig.on('beforeBuild', async () => {
  //   citeproc = makeCiteprocEngine()
  // })


  // ========================================================
  // CONFIGURE
  // ========================================================

  let startEleventy = function () {

    return {

      // Specify which types of templates should be processed
      // https://www.11ty.dev/docs/config/#template-formats
      templateFormats: ["md", "njk"],

      // The template engine to pre-process markdown files.
      // Markdown files run through this template engine before transforming to HTML.
      // https://www.11ty.dev/docs/config/#default-template-engine-for-markdown-files
      markdownTemplateEngine: "njk",


      dataTemplateEngine: "njk",

      // Directories
      dir: {
        // Top-level directory for templates. "." is default.
        input: "src",

        // Includes directory (files, partials, macros). These files are consumed by templates. Relative to input directory.
        includes: "includes",

        // Layouts directory. Relative to input directory.
        layouts: "layouts",

        // Global data files directory (data available to all templates). Relative to input directory. "All *.json and module.exports values from *.js files in this directory will be added into a global data object available to all templates." Per: https://www.11ty.dev/docs/data-global/
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
  // NOTE: I've switched to using npm for this.


  // -------- Plugins -------- //
  // Custom code that Eleventy imports from an external repository

  eleventyConfig.addPlugin(syntaxHighlight)


  // -------- Filters -------- //
  // Called by template engines (e.g. nunjucks)

  // Return excerpts from content
  eleventyConfig.addFilter("excerpt", (content, label) => {

    if (!content) return

    const $ = cheerio.load(content)
    const excerpt = $(label)

    if (excerpt) {
      return excerpt
    } else {
      return
    }
  })

  // Slugify urls, filenames, ids. 
  // Uses https://www.npmjs.com/package/@sindresorhus/slugify
  // This will come built-in with Eleventy 1.0,
  // per https://www.11ty.dev/docs/filters/slugify/
  eleventyConfig.addFilter("slugify", (string) => {
    return slugify(string, {
      lower: true,
      remove: /[*+~.()'"!:@]/g
    })
  })

  // Format dates.
  // Uses https://www.npmjs.com/package/nunjucks-date-filter
  eleventyConfig.addFilter("date", dateFilter)

  // Get hosted image URL
  // For a image filename, return the hosted url path.
  // ffos.jpg --> https://joshcarpenter.ca/img/ffos.jpg
  // We use this for our social media posts.
  // eleventyConfig.addFilter("getHostedImagePath", (filename) => {
  //   const ext = path.extname(filename)
  //   const base = path.basename(filename, ext)
  //   const imgExists = fs.existsSync(`_site/img/${}`)
  //   console.log(base, ext)
  //   return `https://joshcarpenter.ca/img/${filename}`
  // })


  // -------- Collections -------- //
  // Define custom collections

  // Make collections for certain tag combinations
  // 1) Sort alphabetically
  // 2) Filter out posts with specific tags (e.g. "hide")
  
  eleventyConfig.addCollection("climate", (collection) =>
    collection.getFilteredByTags('climate',)
      .sort((a, b) => {
        if (a.data.title > b.data.title) return 1
        else if (a.data.title < b.data.title) return -1
        else return 0
      })
      .filter(post => post.data.publish)
  )
  
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


  // ========================================================
  // CONVERT MARKDOWN TO HTML
  // ========================================================

  // Here we configure markdown-it, the markdown parser used by 11ty.
  // https://github.com/markdown-it/markdown-it
  // Technically, we're specifying our own instance of markdown-it as 11ty's Markdown library. Per: https://www.11ty.dev/docs/languages/markdown/#optional-set-your-own-library-instance

  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
    quotes: '“”‘’',
  })

  // Improve permalinks with uslug
  // Per docs: https://github.com/valeriangalliat/markdown-it-anchor#unicode-support
  // const uslug = require('uslug')
  // const uslugify = (s) => uslug(s)

  // Add marks with `==...===`
  md.use(markdownItMarks)

  // Add sub and sup tag support
  md.use(markdownItSup)
  md.use(markdownItSub)

  // Add anchors to headers
  md.use(markdownItAnchor, {
    level: [2, 3],
    slugify: (s) => slugify(s, {
      lower: true,
      remove: /[*+~.()'"!:@]/g
    }),
    permalink: false,
    // permalinkSymbol: svgAnchorIcon,
  })

  // Add block divs with `::: #warning`
  md.use(markdownItDiv)

  // Add spans with square brackets. Eg: paragraph with [a span]{.myClass}
  md.use(markdownItBracketedSpans)

  // Add classes, identifiers and attributes with curly brackets. Eg: {.class #identifier attr=value}
  md.use(markdownItAttrs)

  // Render images occurring by itself in a paragraph as `<figure>< img ...></figure>`, similar to pandoc's implicit_figures
  md.use(markdownItImplicitFigures, {
    figcaption: true
  })



  // -------------- Register markdown-it as library with 11ty -------------- //

  // This has to go after other Markdown-It configurations (IIUC)
  eleventyConfig.setLibrary("md", md)



  // ========================================================
  // TRANSFORMS
  // ========================================================

  // NOTE: Order matters for some of these, so best not to re-arrange.
  eleventyConfig.addTransform("hangingPunctuation", hangingPunctuation)
  eleventyConfig.addTransform("generateImages", generateImages)
  eleventyConfig.addTransform("removeTodos", removeTodos)
  eleventyConfig.addTransform("renderFootnotes", renderFootnotes)
  eleventyConfig.addTransform("renderCitations", renderCitations)
  // eleventyConfig.addTransform("prettierHtml", prettierHtml)
  eleventyConfig.addTransform("modifyIframes", modifyIframes)
  eleventyConfig.addTransform("makeVideos", makeVideos)
  eleventyConfig.addTransform("modifyFigures", modifyFigures)
  eleventyConfig.addTransform("flagShortPosts",flagShortPosts)
  // eleventyConfig.addTransform("tagAbbreviations", tagAbbreviations)
  eleventyConfig.addTransform("setMetaTags", setMetaTags)

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


  // ========================================================
  // RETURN THE CONFIGURED ELEVENTY OBJECT
  // ========================================================

  return startEleventy()

}

