const fse = require('fs-extra')
const globby = require('globby')

/**
 * Update image paths in post .md files.
 * Before: `img/ocean.png` (img directory is in same folder as .md files)
 * After: `../img/posts/GMSL-1900-2010.png`
 */
function updateImagePaths(file) {
  // Demo: https://regex101.com/r/goasLm/1/
  const regex = new RegExp(/(?:]\()(.*?(?=[^\/]*(?:png|jpg)))(.*?(?:png|jpg))/, 'gm')
  return file.replace(regex, '](../img/posts/$2')
}

/**
 * Set front matter `image` field
 */
function setImageFrontMatterField(file) {
  // Get image field (if present) and current value
  // Demo: https://regex101.com/r/hXzirJ/1
  const imageField = file.match(/^image:(.*?'(.*?)')?/m)
  const imagePath = imageField ? imageField[2] : null

  // If image field exists and is populated, exit this function w/o making changes
  if (imagePath != null && imagePath != '') {
    return file
  }

  // If image field is missing, add one after the title field, and leave it empty.
  // We'll populate it in the next step.
  if (imageField == null) {
    const titleField = file.match(/^title.*/m)
    file = file.replace(titleField, `${titleField}\nimage: ''`)
  }

  // If image field is present but empty, and there's an image(s) in the doc,
  // set value to 'first-image'. 
  if (imagePath == null || imagePath == '') {
    // Find first image in doc
    // Demo: https://regex101.com/r/goasLm/1/
    const img = file.match(/(?:]\()(.*?(?=[^\/]*(?:png|jpg)))(.*?(?:png|jpg))/m)

    if (img) {
      // Construct new image field.
      const imageField = file.match(/^image.*/m)
      const newImageField = `image: 'getFirstImage'`

      file = file.replace(imageField, newImageField)
    }
  }

  return file
}

async function updateNotes() {
  // Find posts
  const posts = globby.sync(`src/posts/tmp/*.md`)

  await Promise.all(
      posts.map(async (post) => {
        let file = await fse.readFile(post, 'utf8')
        // const fileName = post.slice(post.lastIndexOf('/') + 1, post.length)

        // Update
        file = updateImagePaths(file)
        file = setImageFrontMatterField(file)

        // Write
        await fse.writeFile(post, file)
      }),
  )

  console.log(`Updated ${posts.length} fetched climate posts`)
}

updateNotes()
