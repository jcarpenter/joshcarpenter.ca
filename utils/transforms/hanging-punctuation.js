module.exports = function (content) {

  // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!this.outputPath) return content

  content = content.replaceAll(/<p>[“"]/gm, '<p class="hanging-punctuation">“')

  return content

}