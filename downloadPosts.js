const fs = require('fs')
const fsp = require('fs').promises
const downloadGitRepo = require('download-git-repo')
const rimraf = require("rimraf")
const path = require('path')


let tmpPostsPath = path.join(__dirname, 'src/posts/tmp')
let tmpImgPath = path.join(__dirname, 'src/posts/tmp/img')


// Check if temp folder already exists. If yes, delete the contents.
// https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty

function cleanupTempDirectory() {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(tmpPostsPath)) {
            rimraf(tmpPostsPath, (err) => {
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
// If tmp foldere doesn't exist, download-git-repo will create it.

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


// Make a promise-compatible forEach loop
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

// Same approach as copyPosts
function copyImgs(images) {

    let sequence = Promise.resolve();

    images.forEach((img) => {

        let oldPath = path.join(__dirname, 'src/posts/tmp/img', img);
        let newPath = path.join(__dirname, 'src/posts/img', img);

        // Add these actions to the end of the sequence
        sequence = sequence.then(() => {
            return fsp.rename(oldPath, newPath)
        })
    })

    // Return the sequence
    return sequence
}


// Sequence of promises

// Empty tmp directory. It shouldn't exist, but just in case.
cleanupTempDirectory()

    // Download latest from climate-research repo
    .then(() => downloadLatestFromRepo())
    .catch(err => console.log(err))

    // Copy posts out of tmp/
    .then(() => { return fsp.readdir(tmpPostsPath) })
    .catch(err => console.log(err))
    .then(posts => copyPosts(posts))
    .catch(err => console.log(err))

    // Copy images out of tmp/img/
    .then(() => { return fsp.readdir(tmpImgPath) })
    .catch(err => console.log(err))
    .then(images => copyImgs(images))
    .catch(err => console.log(err))

    // Delete tmp files
    .then(() => cleanupTempDirectory)
    .catch(err => console.log(err))

    // Delete tmp/img directoy 
    .then(() => { return fsp.rmdir(tmpImgPath) })
    .catch(err => console.log(err))

    // Delete tmp directory
    .then(() => { return fsp.rmdir(tmpPostsPath) })
    .catch(err => console.log(err))
