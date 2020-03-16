#!/bin/bash

# Check if our temp directory already exists. If yes, remove it.
if [ -d src/posts/tmp ]; then
    rm -rf src/posts/tmp
fi

# Create tmp directory
mkdir src/posts/tmp
cd src/posts/tmp

# Clone "exported-posts" branch of climate-research repo.
git clone --single-branch --branch exported-posts https://github.com/jcarpenter/climate-research.git

cd climate-research

# NOTE: Following steps are to resolve PNG errors are no longer needed. Because I now use gulp-responsive to process images, and it's not having problems processing the unmodified PNGs.

# Compress PNGs. Saving from pngquant also resolves any PNG format errors.
# This is important because Apple's default macOS PNG-creation tools (e.g. screenshot)
# create PNGs with errors (per pngcheck) that then conflict with subsequent resize tools.
# pngquant --ext=.png --force --skip-if-larger img/*.png

# Confirm PNGs are error-free
# pngcheck img/*.png

# Move markdown files to src/posts/. `\cp` overwrites without asking first
\cp *.md ../../

# Move images to src/posts/img/
\cp img/* ../../img/

cd ../../../../
rm -rf src/posts/tmp

echo 'Download complete'