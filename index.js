var vfile = require('to-vfile')
var report = require('vfile-reporter')
var unified = require('unified')
var stream = require('unified-stream')
var parse = require('remark-parse')
var frontmatter = require('remark-frontmatter')
var sectionize = require('remark-sectionize')
var rehype = require('remark-rehype')
var document = require('rehype-document')
var stringify = require('rehype-stringify')
var format = require('rehype-format')

var processor = unified()
  .use(parse, { footnotes: true })
  .use(sectionize) // Add sections
  .use(frontmatter, { type: 'yaml', marker: '-' })
  .use(rehype)
  .use(document, { title: "Josh's Site", css: "style.css", })
  .use(format)
  .use(stringify)
  .process(vfile.readSync('testing.md'), function (err, file) {
    if (err) throw err
    console.error(report(file))
    file.extname = '.html'
    vfile.writeSync(file)
  })

  // process.stdin.pipe(stream(processor)).pipe(process.stdout)
  