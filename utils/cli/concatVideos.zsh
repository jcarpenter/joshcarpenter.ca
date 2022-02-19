#!/bin/zsh

# Concatenate multiple videos into one.
# Will not re-encode or resize.
# Use like: 
# ./concatVideos.zsh cat.mp4 dog.mp4 owl.mp4
# Saves `concat-output` file to same directory as first file.
# Saves in same format as first file.

files=($@)

outputDir=$files[1]:h
outputExt=$files[1]:t:e
outputPath="$outputDir/concat-output.$outputExt"

ffmpeg -f concat -safe 0 -i <(for f in $files; do echo "file '$f'"; done) -c copy $outputPath
