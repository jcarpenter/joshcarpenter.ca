const path = require("path");
const prettier = require('prettier')

module.exports = function (content, outputPath) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!outputPath) return content

  const extname = path.extname(outputPath);
  switch (extname) {
    case ".html":
    case ".json":
      // Strip leading period from extension and use as the Prettier parser.
      const parser = extname.replace(/^./, "");
      return prettier.format(content, { parser });

    default:
      return content;
  }
}