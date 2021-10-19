/*
We use eleventyComputedData to defined data properties at the _end_
of the data Data Cascade. This lets us define those properties 
based on other data values (e.g. template frontmatter).

In particular, we use eleventyComputerData to set our permalinks.

Docs: https://www.11ty.dev/docs/data-computed/
*/

module.exports = {
  
  // Define the document permalink.
  permalink: (data) => {

    // If doc defines it's own permalink in front matter, and
    // publish is not `false`, use the specified permalink
    // E.g. "/aframe/"
    if (data.permalink && data.publish !== false) return data.permalink

    // If `publish` is missing or false, don't publish the file.
    // Setting `permalink: false` in the page's front matter tells
    // Eleventy not to write it to disk.
    // Per: https://www.11ty.dev/docs/permalinks/#permalink-false
    if (!data.publish) return false

    // Else, if doc has "title" in front matter, use as permalink
    // (with the slug filter applied, to remove spaces, etc)
    // E.g. "title: Nuclear Power: Risks" gets published to 
    // `/nuclear-power-risks/index.html`
    if (data.title) {
      return `/{{ title | slugify }}/`
    }

    // Else, use the doc filename as the permalink, 
    // (with the slug filter applied)
    if (data.page.fileSlug) {
      return `/{{ page.fileSlug | slugify }}/`
    }

    // Else, return false (doc won't be written to disk)
    return false

    // Determine title:
    // - Use 'title' from front matter, if present.
    // - Else, use first h1 (e.g. `# Nuclear Power: Risks`)
    // const frontMatterTitle = data.title


    // const h1Title = data.content.match(/# (.*)/)[1]

    // return frontMatterTitle ? frontMatterTitle : h1Title

  }
}