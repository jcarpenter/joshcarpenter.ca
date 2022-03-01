const cheerio = require('cheerio')

// Markdown-it
const MarkdownIt = require("markdown-it")
const markdownItAnchor = require("markdown-it-anchor")
const markdownItAttrs = require("markdown-it-attrs")
const markdownItBracketedSpans = require("markdown-it-bracketed-spans")
const markdownItClass = require("@toycode/markdown-it-class")
const markdownItDiv = require("markdown-it-div")
const markdownItHeaderSections = require('markdown-it-header-sections')
const markdownItModifyToken = require("markdown-it-modify-token")
const markdownItImplicitFigures = require("markdown-it-implicit-figures")
const markdownItMarks = require("markdown-it-mark")
const markdownItSub = require("markdown-it-sub")
const markdownItSup = require("markdown-it-sup")

// Filters
const dateFilter = require("nunjucks-date-filter")
const slugify = require("slugify")

// Plugins
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")

// Transforms
const citations = require('./utils/transforms/citations')
const figures = require('./utils/transforms/figures')
const footnotes = require('./utils/transforms/footnotes')
const hangingPunctuation = require('./utils/transforms/hanging-punctuation')
const iframes = require('./utils/transforms/iframes')
const lightbox = require('./utils/transforms/lightbox')
const removeEmptyTableHeads = require('./utils/transforms/remove-empty-table-heads')
const removeTodos = require('./utils/transforms/remove-todos')
const stopMeasurementsWrapping = require('./utils/transforms/stop-measurements-wrapping')
const videos = require('./utils/transforms/videos')
// const tagAbbreviations = require('./utils/transforms/tag-abbreviations')

module.exports = (config) => {
  
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

  // eleventyConfig.on('beforeBuild', async () => {
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


  // -------- Ignore files -------- //
  // Tell eleventy to ignore certain files.
  // Am doing it here instead of an .eleventyIgnore file.
  // Docs: https://www.11ty.dev/docs/ignores/

  config.ignores.add("README.md")


  // -------- Enable Deep Data Merge -------- //
  // This feature allows additive tags (combine tags from multiple levels of the data cascade, instead of replacing them). It may have unintended side effects, however.
  // Per: https://www.11ty.dev/docs/data-deep-merge/
  // Per: https://www.11ty.dev/docs/data-cascade/
  // As of 1.0, this is on by default.

  config.setDataDeepMerge(true)


  // -------- Passthrough file copy -------- //
  // Copy files and directories to output directories
  // NOTE: I've switched to using npm for this.


  // -------- Filters -------- //
  // Called by template engines (e.g. nunjucks)

  // Return excerpts from content
  config.addFilter("excerpt", (content, label) => {

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
  // Uses https://www.npmjs.com/package/slugify
  // This will come built-in with Eleventy 1.0,
  // per https://www.11ty.dev/docs/filters/slugify/
  config.addFilter("slugify", (string) => {
    return slugify(string, {
      lower: true,
      remove: /[\*+~.,()'"!:@]/g
    })
  })

  // Format dates.
  // Uses https://www.npmjs.com/package/nunjucks-date-filter
  // And momentjs formats: https://momentjs.com/docs/#/displaying/format/
  // E.g: Posted on {{ page.date | date("MMM D YYYY") }}.
  // "Posted on Dec 28 2021"
  config.addFilter("date", dateFilter)


  // -------- Collections -------- //
  // Define custom collections

  // Portfolio
  config.addCollection("portfolio", (collection) => 
    collection.getFilteredByTags("ux")
      .filter((post) => post.data.publish)
      .sort((a, b) => b.data.year - a.data.year)
  )

  // Posts
  config.addCollection("posts", (collection) => 
    collection.getFilteredByTags("post")
      // Remove posts marked 'publish: false'
      .filter((post) => post.data.publish)
      .sort((a, b) => b.data.date - a.data.date)
      // Newest at top
      // // Put 'highlight' posts at top
      // .sort((a, b) => a.data.tags.includes("highlight") ? -1 : 1)
  )

  // Portfolio
  config.addCollection("projects", (collection) => 
    collection.getFilteredByTags("project")
      .filter((post) => post.data.publish)
      .sort((a, b) => b.data.year - a.data.year)
  )

  // Climate posts
  config.addCollection("climate", (collection) =>
    collection.getFilteredByTags("climate")
      // Remove posts marked 'publish: false'
      .filter((post) => post.data.publish)
      // Sort alphabetically
      // .sort((a, b) => {
      //   if (a.data.title > b.data.title) {
      //     return 1
      //   } else if (a.data.title < b.data.title) {
      //     return -1
      //   } else {
      //     return 0
      //   }
      // })
      // Put 'explainer' posts at top
      .sort((a, b) => {
        if (a.data.tags.includes("explainer")) {
          return -1
        } else {
          return 1
        }
      })
      // Put 'highlight' posts at top
      .sort((a, b) => {
        if (a.data.tags.includes("highlight")) {
          return -1
        } else {
          return 1
        }
      })
  )

  // -------- Plugins -------- //

  config.addPlugin(syntaxHighlight);

  
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
    // markdownItModifyToken configuration
    modifyToken: function(token, env) {
      switch (token.type) {
        case 'image': {
          // Add `data-lightbox` attribute to images
          token.attrObj['data-lightbox'] = true
          // Set `data-res` of images
          // If it's a splash image, it gets Large-Medium-Small
          // Else, it gets Medium-Medium-Small
          const resolution = token.attrObj['class']?.includes('splash') ? "LMS" : "MMS"
          token.attrObj['data-res'] = resolution
        }
      }
    }
  })

  // Improve permalinks with uslug
  // Per docs: https://github.com/valeriangalliat/markdown-it-anchor#unicode-support
  // const uslug = require('uslug')
  // const uslugify = (s) => uslug(s) 

  // Add classes
  // md.use(markdownItClass, {
  //   blockquote: "body-text",
  //   p: "body-text",
  //   ul: "body-text",
  //   ol: "body-text",
  //   figcaption: "caption-clr small-text"
  // })

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
      remove: /[*+~.,()'"!:@]/g
    }),
    permalink: markdownItAnchor.permalink.headerLink({ safariReaderFix: true }),
    tabIndex: false
    // permalinkSymbol: svgAnchorIcon,
  })

  // Add block divs with `::: #warning`
  md.use(markdownItDiv)

  // Add spans with square brackets. 
  // Eg: paragraph with [a span]{.myClass}
  md.use(markdownItBracketedSpans)

  // Add classes, identifiers and attributes with curly brackets. 
  // Eg: {.class #identifier attr=value}
  md.use(markdownItAttrs)

  // Wrap headers in sections
  md.use(markdownItHeaderSections)

  // Render images occurring by itself in a paragraph as `<figure>< img ...></figure>`, similar to pandoc's implicit_figures
  md.use(markdownItImplicitFigures, {
    figcaption: true,
    copyAttrs: 'class'
  })

  // Add data-lightbox attribute to figures
  md.use(markdownItModifyToken)

  // Add data-lightbox attribute to figures 
  // (Alternative to using markdown-it-modify-token plugin)
  // md.renderer.rules.figure_open = function (tokens, idx, options, env, self) {
  //   tokens[idx].attrPush(['data-lightbox', true]); // add new attribute
  //   // Pass token to default renderer
  //   return self.renderToken(tokens, idx, options);
  // }
  


  // -------------- Register markdown-it as library with 11ty -------------- //

  // This has to go after other Markdown-It configurations (IIUC)
  config.setLibrary("md", md)



  // ========================================================
  // SHORTCODES
  // ========================================================

  config.addShortcode("year", () => `${new Date().getFullYear()}`)

  // ========================================================
  // TRANSFORMS
  // ========================================================

  // NOTE: Order matters for some of these, so best not to re-arrange.
  config.addTransform("removeTodos", removeTodos)
  config.addTransform("footnotes", footnotes)
  config.addTransform("citations", citations)
  config.addTransform("modifyIframes", iframes)
  config.addTransform("videos", videos)
  config.addTransform("figures", figures)
  config.addTransform("lightbox", lightbox)
  // eleventyConfig.addTransform("metaImage", metaImage)
  config.addTransform("hangingPunctuation", hangingPunctuation)
  config.addTransform("removeEmptyTableHeads", removeEmptyTableHeads)
  config.addTransform("stopMeasurementsWrapping", stopMeasurementsWrapping)
  // eleventyConfig.addTransform("tagAbbreviations", tagAbbreviations)



  // ========================================================
  // RETURN THE CONFIGURED ELEVENTY OBJECT
  // ========================================================

  return startEleventy()

}

