module.exports = function (content, outputPath) {

    // Exit early if output path is false, because we aren't 
  // going to write this doc to disk. Perf savings.
  if (!outputPath) return content

  content = content.replaceAll(/<p>[“"]/gm, '<p class="hanging-punctuation">“')

  return content

}