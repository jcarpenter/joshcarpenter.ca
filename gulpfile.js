const browserSync = require('browser-sync')
const cheerio = require('cheerio')
const cp = require('child_process')
const del = require('del')
const eslint = require("gulp-eslint");
const git = require('gulp-git');
const gulp = require('gulp')
const jsonlint = require("gulp-jsonlint");
const modifyFile = require('gulp-modify-file')
const responsive = require('gulp-responsive')
const sass = require('gulp-sass')

// -------- Variables -------- //

const SRC = 'src'
const BUILD = '_site'


/* 
========================================================
PREP MARKDOWN
========================================================================== */

// If image field is missing (null) or present but has no value, 
// populate it with the first image in the document.
// function set_image_front_matter_field() {
//   return gulp
//     .src([
//       `${SRC}/**/*.md`
//     ], { base: `${SRC}` })
//     .pipe(modifyFile((content, path, file) => {

//       let titleField = content.match(/^title.*/m)

//       // Get image field (if present) and current value
//       // Demo: https://regex101.com/r/hXzirJ/1
//       let imageField = content.match(/^image:(.*?'(.*?)')?/m)
//       let imagePath = imageField ? imageField[2] : null

//       // If image field exists and is populated, exit this function w/o making changes
//       if (imagePath != null && imagePath != '') {
//         return content
//       }

//       // If image field is missing, add one after the title field, and leave it empty.
//       // We'll populate it in the next step.
//       if (imageField == null) {
//         content = content.replace(titleField, `${titleField}\nimage: ''`)
//       }

//       // If image field is present but empty, and there's an image(s) in the doc,
//       // get the first image, and populate the field with it.
//       if (imagePath == null || imagePath == '') {

//         imageField = content.match(/^image.*/m)

//         // Find first image in doc
//         // Demo: https://regex101.com/r/uQLtoT/1
//         // Full match example: `(/img/aframe-logo.jpg`
//         // Group 1: `/img/aframe-logo.jpg`
//         let img = content.match(/(?:\()(?!.*?\()(.*?(?:png|jpg))/m)

//         if (img) {

//           // Get first group
//           img = img[1]

//           // Get name. E.g. `GMSL-1900-2010`
//           let name = img.substring(img.lastIndexOf('/') + 1, img.lastIndexOf('.'))

//           // Get extension. E.g. `png`
//           let ext = img.substring(img.lastIndexOf('.') + 1, img.length)

//           // Construct new image field.
//           let newImageField = `image: '${name}.${ext}'`

//           content = content.replace(imageField, newImageField)

//         }
//       }

//       return content
//     }))
//     .pipe(gulp.dest(`${SRC}`))
// }

// function wrap_todos_in_span() {
//   return gulp
//     .src([
//       `${SRC}/**/*.md`
//     ], { base: `${SRC}` })
//     .pipe(modifyFile((content, path, file) => {

//       let todoReg = new RegExp(/(TODO:(?:[^.]+)[^{])\./, 'gm')
//       content = content.replace(todoReg, '[$1]{.todo}.')

//       return content
//     }))
//     .pipe(gulp.dest(`${SRC}`))
// }


/* 
========================================================
PREP
========================================================================== */

// Delete contents of build directory, if it exists
// See: https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md
// function clean() {
//   return del([
//     `${BUILD}/**/ * `
//   ])
// }


/* 
========================================================
ASSETS (JS, JSON, IMAGES, ETC)
========================================================================== */

// -------- Misc assets -------- //

// function copy_misc_assets() {
//   return gulp
//     .src([
//       `${SRC} / styles / fonts/**/ * `,
//       `${SRC} / styles / prism/**/ * `
//     ], { base: `${SRC}` })
//     .pipe(gulp.dest(`${BUILD}`))
// }

// -------- JS and JSON-------- //

// function copy_js() {
//   return gulp
//     .src(`${SRC} / js/*.js`, { base: `${SRC}` })
//     // .pipe(eslint({
//     //   fix: true
//     // }))
//     // .pipe(eslint.format())
//     // .pipe(eslint.failAfterError())
//     .pipe(gulp.dest(`${BUILD}`))
// }

// function copy_third_party_js() {
//   return gulp
//     .src(`${SRC}/js/third-party/**/*.js`, { base: `${SRC}` })
//     .pipe(gulp.dest(`${BUILD}`))
// }

// function copy_json() {
//   return gulp
//     .src(`${SRC} / js/**/ *.json`, { base: `${SRC}` })
//     .pipe(jsonlint())
//     .pipe(jsonlint.reporter())
//     .pipe(gulp.dest(`${BUILD}`))
// }

// -------- CSS -------- //

// function generate_css() {
//   return gulp
//     .src(`${SRC}/styles/main.scss`)
//     .pipe(sass({
//       outputStyle: "expanded"
//     }).on('error', sass.logError))
//     .pipe(gulp.dest(`${BUILD}/styles`))
// }

// -------- SVG and GIF -------- //

// We simply copy these, without processing or resizing (unlike JPEG and PNGs).
// Find SVG and GIFs in img/ and copy to same directory structure in build.

// function copy_svg_and_gif() {
//   return gulp
//     .src([
//       `${SRC}/img/*.{svg,gif}`,
//       `${SRC}/img/design/*.{svg,gif}`,
//       `${SRC}/img/posts/*.{svg,gif}`,
//     ])
//     .pipe(gulp.dest(`${BUILD}/img`))
// }

// -------- JPEG and PNG -------- //

// Resize JPG and PNGs to multiple sizes for use in HTML responsive images. 
// Do not enlarge the output if the input is less than the specified dimension(s).
// Convert to JPEG. Compress. Strip metadata.

const images_config = {
  '**/* ': [{
    width: 600, rename: { suffix: '-600px', extname: '.jpg' },
  }, {
    width: 900, rename: { suffix: '-900px', extname: '.jpg' }
  }, {
    width: 1440, rename: { suffix: '-1440px', extname: '.jpg' }
  }],
}

const images_options = {
  // The output quality for JPEG, WebP and TIFF output formats
  quality: 85,
  // Use progressive (interlace) scan for JPEG and PNG output
  progressive: true,
  // Strip all metadata
  withMetadata: false,
  // Do not enlarge the output image if the input image are already less than the required dimensions.
  withoutEnlargement: true,
  skipOnEnlargement: false, // that option copy original file with/without renaming
  errorOnEnlargement: false,
  background: '#fff',
  flatten: true,
  // Do not emit the error when image is enlarged.
  // errorOnUnusedImage: false,
}

function resize_jpg_and_png() {
  return gulp
    .src([
      `${SRC}/img/design/*.{jpg,png}`,
      `${SRC}/img/posts/*.{jpg,png}`,
    ])
    .pipe(responsive(
      images_config,
      images_options
    ))
    .pipe(gulp.dest(`${BUILD}/img/`))
}


/* 
========================================================
ELEVENTY
========================================================================== */

// function eleventy() {
//   return cp.exec('npx @11ty/eleventy', (err, stdout, stderr) => {
//     if (err) throw err
//     console.log(stdout)
//   })
// }


/* 
========================================================
REFINE HTML
========================================================================== */


// -------------- Add hanging-punctuation class to <p> starting with `"` -------------- //

// Check if first character of paragraph is a quotation mark. If yes, add class.
// TODO: May want to add this to blockquotes too?
function add_hanging_punctuation() {
  return gulp
    .src(`${BUILD}/**/*.html`)
    .pipe(modifyFile((content, path, file) => {

      content = content.replace(/(<p>“)/gm, '<p class="hanging-punctuation">“')
      return content
    }))
    .pipe(gulp.dest(`${BUILD}`))
}

// -------------- Prep figures -------------- //

// If figures contain media, prep them for lightbox,
// by assigning a unique ID, and the lightbox attribute.
function prep_figures_for_lightbox() {
  return gulp
    .src(`${BUILD}/**/*.html`)
    .pipe(modifyFile((content, path, file) => {

      let mediaSrc, mediaName, figId, capId

      const $ = cheerio.load(content)
      const figures = $('article > figure')

      figures.each(function () {

        const fig = $(this)
        const img = fig.find('img')
        const video = fig.find('video')

        // Get filename from the media
        if (img) {
          mediaSrc = img.attr('src')
        } else if (video) {
          mediaSrc = video.attr('src')
        } else {

          // If no media exists, return. 
          // We only want to assign lightbox to figures with media.
          return
        }

        if (mediaSrc) {
          // Extract the filename from the src path, w/o the `-600px` or file extension (so it's cleaner).
          // E.g. fukushima
          mediaName = mediaSrc.substring(mediaSrc.lastIndexOf("/") + 1, mediaSrc.lastIndexOf("."))
          // Add '-fig' suffix. 
          // E.g. fukushima-fig
          figId = `${mediaName}-fig`
          // Assign id
          fig.attr('id', figId)
          // Assign lightbox attribute
          fig.attr('data-lightbox', 'true')
        }
      })

      content = $.html()
      return content
    }))
    .pipe(gulp.dest(`${BUILD}`))
}

// Add aria-labelledby and role to figures
// If figure contains img, and img has `title` text, swap `title` to `alt``
// We have to do this because of limits in pandoc-flavored Markdown.
// Figures are defined as follows: ![Caption text](image-path.jpg "Title text")
// It does not let us define image alt text. So instead we use the title text.
function prep_figures_for_a11y() {
  return gulp
    .src(`${BUILD}/**/*.html`)
    .pipe(modifyFile((content, path, file) => {

      const $ = cheerio.load(content)
      const figures = $('#post-body figure')
      let index = 0

      figures.each(function () {

        const fig = $(this)
        const figId = fig.attr('id') // E.g. fukushima-fig
        const figcap = fig.find('figcaption')

        if (figcap) {

          // Generate ID. Use figId as base, if it exists. Else make new unique id.
          // E.g. fukushima-figcap [or] fig4-figcap. 
          const figcapId = figId ? `${figId}cap` : `fig${index}-figcap`

          // Set ID
          figcap.attr('id', figcapId)

          // Add aria-labelledby
          fig.attr('aria-labelledby', figcapId)
        }

        const img = fig.find('img')

        if (img) {
          const title = img.attr('title')
          // console.log(title)
          if (title) {
            // Make alt text = title text
            img.attr('alt', title)
            // Remove title attribute
            img.attr('title', null)
          }
        }

        // Add role="figure", for backwards compatibility sake.
        fig.attr('role', 'figure')

        index++

      })

      content = $.html()
      return content
    }))
    .pipe(gulp.dest(`${BUILD}`))
}

// -------------- Update image paths -------------- //

// In build, image paths are absolute, and img/ contents are flat, so we do:
// Before: `../img/post/hello.jpg`
// After: `/img/hello.jpg`
function update_image_paths() {
  return gulp
    .src(`${BUILD}/**/*.html`)
    .pipe(modifyFile((content, path, file) => {

      const $ = cheerio.load(content)
      const images_in_main = $('main img')

      images_in_main.each(function () {

        // Get src
        let src = $(this).attr('src')

        // Get name (with extension)
        let filename = src.substring(src.lastIndexOf("/") + 1, src.length)

        let newSrc = `/img/${filename}`

        $(this).attr('src', newSrc)
      })

      content = $.html()

      return content
    }))
    .pipe(gulp.dest(`${BUILD}`))
}

// -------------- Add responsive attributes to images -------------- //

function add_responsive_attributes_to_images() {
  return gulp
    .src(`${BUILD}/**/*.html`)
    .pipe(modifyFile((content, path, file) => {

      const $ = cheerio.load(content)
      const images_in_main = $('main img')

      images_in_main.each(function () {

        // Get the image src
        let src = $(this).attr('src')
        let ext = src.slice(src.length - 3)

        // Only add responsive attributes to jpg and pngs
        if (ext == 'jpg' || ext == 'png') {

          // Define `srcset` values
          let size1 = src.substring(0, src.lastIndexOf(".")) + '-600px.jpg 600w'
          let size2 = src.substring(0, src.lastIndexOf(".")) + '-900px.jpg 900w'
          let size3 = src.substring(0, src.lastIndexOf(".")) + '-1440px.jpg 1440w'

          // Set `srcset` and `sizes` attributes
          $(this).attr('srcset', `${size1}, ${size2}, ${size3}`)
          $(this).attr('sizes', '(min-width: 600px) 572px, 90vw')

          // Set `src` to point to 600px version of image
          // (a fallback for older browsers that lack `srcset` support)
          src = src.substring(0, src.lastIndexOf(".")) + '-600px.jpg'
          $(this).attr('src', src)
        }
      })

      content = $.html()

      return content
    }))
    .pipe(gulp.dest(`${BUILD}`))
}

// -------------- Create foonotes and referenced works -------------- //

// If there are any footnotes, create footnotes section.
// If any of the footnotes contain `class="citation"`, create references section.

function create_foonotes_and_referencedworks() {
  return gulp
    .src(`${BUILD}/**/*.html`)
    .pipe(modifyFile((content, path, file) => {

      const $ = cheerio.load(content)
      const post_body = $('#post-body')
      const marks = $('#post-body mark')
      const citations = $('#post-body mark .citation')

      const footnotes_open = `<section id="footnotes" aria-labelledby="footnotes-header" class="thick-border">\n<h2 id="footnotes-header">Footnotes</h2>\n<ul class="two-column-list">`
      const footnotes_close = `\n</ul>\n</section>`
      const references_open = `<section id="refernces" aria-labelledby="references-header" class="thick-border">\n<h2 id="references-header">Referenced works</h2>\n<ul class="two-column-list">`
      const references_close = `\n</ul>\n</section>`

      let index = 1
      let footnotes_list = ''
      let references_list = ''

      if (marks.length == 0) return content

      marks.each(function () {

        const mark = $(this)
        const mark_contents = mark.html()
        const link_to_fn = `<a href="#fn${index}" id="fn-ref${index}" class="fn-link" aria-label="Footnote ${index}">${index}</a>`
        const link_back = `<a href="#fn-ref${index}" class="fn-back-link" aria-label="Back to content">\u21a9\uFE0E</a>`
        const list_item = `<li id="fn${index}" class="fn-item" aria-label="Footnote ${index}">${mark_contents} ${link_back}</li>`

        // Add <li> with mark contents
        footnotes_list += `\n${list_item}`

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
    }))
    .pipe(gulp.dest(`${BUILD}`))
}


/* 
========================================================
SERVE & WATCH
========================================================================== */

// -------- Serve -------- //

const server = browserSync.create()

function reload(cb) {
  server.reload()
  cb()
}

function serve(cb) {
  server.init({
    server: {
      baseDir: BUILD,
    },
    open: false,
    notify: false,
    ghostMode: false
  })
  cb()
}

// -------- Watch -------- //

function watch() {

  // JS and JSON
  gulp.watch(`${SRC}/js/*.js`, gulp.series(copy_js, reload))
  gulp.watch(`${SRC}/js/third-party/**/*.js`, gulp.series(copy_third_party_js, reload))
  gulp.watch(`${SRC}/**/*.json`, gulp.series(copy_json, eleventy, refine_html, reload))

  // CSS
  gulp.watch(`${SRC}/styles/*.scss`, gulp.series(generate_css, reload))

  // Images
  gulp.watch(`${SRC}/**/*.{svg,gif}`, gulp.series(copy_svg_and_gif, reload))
  gulp.watch(`${SRC}/**/*.{jpg,png}`, gulp.series(resize_jpg_and_png, reload))

  // Markdown, NJK, JSON
  gulp.watch([
    `${SRC}/**/*.md`,
    `${SRC}/**/*.njk`,
    `.eleventy.js`
  ], gulp.series(prep_markdown, eleventy, refine_html, reload))

  // Gulpfile (restart gulp if gulpfile changes)
  // gulp.watch('gulpfile.js', restart);
}


/* 
========================================================
EXPORTS
========================================================================== */

// -------- Re-usable sequences -------- //

// Images
// const images = gulp.parallel(
//   copy_svg_and_gif,
//   resize_jpg_and_png
// )

// // JS
// const js_and_json = gulp.parallel(
//   copy_js,
//   copy_third_party_js,
//   copy_json
// )

// Markdown
// const prep_markdown = gulp.series(
//   set_image_front_matter_field,
//   wrap_todos_in_span,
// )

// HTML
const refine_html = gulp.series(
  add_hanging_punctuation,
  prep_figures_for_lightbox,
  prep_figures_for_a11y,
  update_image_paths,
  add_responsive_attributes_to_images,
  create_foonotes_and_referencedworks,
  // modify_references,
  // modify_footnotes,
  // add_aria_role_to_blockquotes
)


// -------- Exports (called from NPM) -------- //

exports.test = gulp.series(create_foonotes_and_referencedworks)

exports.dev = gulp.series(
  // clean,
  gulp.parallel(
    // images,
    // js_and_json,
    // copy_misc_assets,
    // generate_css, 
  ),
  // prep_markdown,
  // eleventy,
  // refine_html,
  serve,
  watch
)

exports.dev_without_images = gulp.series(
  // clean,
  gulp.parallel(
    // js_and_json,
    // copy_misc_assets,
    // generate_css, 
  ),
  // prep_markdown,
  // eleventy,
  // refine_html,
  serve,
  watch
)
  "watch:css": "onchange 'src/scss/*.scss' -- npm run build:css",
  "watch:js": "onchange 'src/js/*.js' -- npm run build:js",

exports.build = gulp.series(
  // clean,
  gulp.parallel(
    // images,
    // js_and_json,
    // copy_misc_assets,
    // generate_css, 
  ),
  // eleventy,
  // refine_html
)