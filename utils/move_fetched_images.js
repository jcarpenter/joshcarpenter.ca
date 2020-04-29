const fse = require('fs-extra')
const globby = require('globby')
const sharp = require('sharp')

async function getFilesize(path) {
  const { size } = await fse.stat(path)
  return size
}

async function getDimensions(path) {
  const { width, height } = await sharp(path).metadata()
  return {
    x: width,
    y: height,
  }
}

/**
 * Only keep fetched images if they're 1) new, or 2) different from existing version.
 * Difference is determined by comparing filesize and dimensions.
 * If the criteria is met, move the fetched image to src/img/posts/, with overwrite true.
 * If not, leave the image in tmp/img/. It will be deleted in subsequent npm script step.
 */

const fetchedImages = globby.sync('src/posts/tmp/img/**/*')

fetchedImages.map(async fetchedImg => {
  const filename = fetchedImg.substring(fetchedImg.lastIndexOf('/') + 1)
  const sameFilenameInImagesDir = `src/img/posts/${filename}`
  const alreadyExists = await fse.pathExists(sameFilenameInImagesDir)

  if (!alreadyExists) {
    await fse.move(fetchedImg, sameFilenameInImagesDir)
  } else {

    // Get existing version's stats
    const existingVersion = {
      filesize: await getFilesize(sameFilenameInImagesDir),
      dimensions: await getDimensions(sameFilenameInImagesDir),
    }

    // Get new version's stats
    const newVersion = {
      filesize: await getFilesize(fetchedImg),
      dimensions: await getDimensions(fetchedImg),
    }

    // Compare new and existing versions.
    // We first stringify the objects so we can do the comparison.
    // Note: Stringify is naive. It doesn't take into account order of values. 
    // E.g. It would return false comparing "{cities: [Seattle, Calgary]}" and "{cities: [Calgary, Seattle]}"
    // But that's not a factor in our simple use case.
    if (JSON.stringify(newVersion) !== JSON.stringify(existingVersion)) {
      await fse.move(fetchedImg, sameFilenameInImagesDir, { overwrite: true })
    }
  }
})