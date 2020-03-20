const fs = require('fs')
const fsp = require('fs').promises
const downloadGitRepo = require('download-git-repo')
const rimraf = require("rimraf")
const path = require('path')
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');


let tmpPath = path.join(__dirname, 'src/posts/tmp')

// Check if temp folder already exists. If yes, delete the contents.
// https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty

function cleanupFiles() {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(tmpPath)) {
            rimraf(tmpPath, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        } else {
            resolve()
        }
    })
}


// Download latest posts from climate-research repo, exported-posts branch,
// which is setup like a gh-pages branch (e.g. has no source files).
// Am using https://www.npmjs.com/package/download-git-repo. clone = true
// is necessary for private repos. 
// If tmp folder does not exist, download-git-repo will create it.

function downloadLatestFromRepo() {
    return new Promise((resolve, reject) => {
        downloadGitRepo('direct:https://github.com/jcarpenter/climate-research.git#exported-posts', 'src/posts/tmp', { clone: true }, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

// Copy markdown files
// Uses a promise-compatible forEach loop
// Per: https://developers.google.com/web/fundamentals/primers/promises?#creating_a_sequence

function copyPosts(posts) {

    // Start off with a promise that always resolves
    let sequence = Promise.resolve();

    // Loop through the posts
    posts.forEach((post) => {

        let fileExtension = path.extname(post)

        //  Check for markdown files
        if (fileExtension == '.md') {

            let oldPath = path.join(__dirname, 'src/posts/tmp', post);
            let newPath = path.join(__dirname, 'src/posts', post);

            // Add these actions to the end of the sequence
            sequence = sequence.then(() => {
                return fsp.rename(oldPath, newPath)
            })
        }
    })

    // Return the sequence
    return sequence
}


// Optimize images with pngquant and jpegtran, then copy them

function copyImgs() {

    let inputFiles = path.join(__dirname, 'src/posts/tmp/img/*.{png,jpg}');
    let outputDir = path.join(__dirname, 'src/posts/img');

    return imagemin([inputFiles], {
        destination: outputDir,
        plugins: [
            imageminJpegtran(),
            imageminPngquant({
                quality: [0.6, 0.8],
                strip: true
            })
        ]
    })
}


// Sequence of promises

downloadLatestFromRepo()
    .catch(err => console.log(err))

    // Copy posts out of tmp/
    .then(() => { return fsp.readdir(tmpPath) })
    .catch(err => console.log(err))
    .then(posts => copyPosts(posts))
    .catch(err => console.log(err))

    // Copy images out of tmp/img/
    .then(() => copyImgs())
    .catch(err => console.log(err))

    // Delete tmp files
    .then(() => cleanupFiles())
    .catch(err => console.log(err))