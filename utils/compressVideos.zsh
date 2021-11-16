#!/bin/bash

# Convert input videos (or gifs) to compressed WebM and MP4.
# Optionally crop width and/or height, 
# and proportionally scale width.
# Framerate is preserved.
# Output files are saved to same name and path as input.
# Use like: `./compressVideos.sh path/to/myvideo.gif 800`

# [Required]: Input file path
inputPath=$1
inputPathExtension="${inputPath##*.}"
inputPathWithoutExtension="${inputPath%.*}"

# [Optional]: Width to scale to.
# If original input width is less than this value, we will not resize.
# Default is 4000 (high enough that most videos will not be resized).
maxWidth=${2:-4000} 

# [Optional]: Width to crop to, before scaling is applied.
# Default is input width (no width cropping).
cropWidthTo=${3:-'in_w'}

# [Optional]: Height to crop to, before scaling is applied.
# Default is input height (no height cropping).
cropHeightTo=${4:-'in_h'}

# Crop to this width/height...
cropFilter="crop=$cropWidthTo:$cropHeightTo"

# ...then scale proportionately to this width.
scaleFilter="scale='min($maxWidth, iw)':-2"

# Quickly preview output without generating compressed versions.
# ffplay -i /Users/josh/Desktop/ChromeVR\ WIP/2d-browsing.mp4 -vf "${cropFilter}, ${scaleFilter}"

# Create WebM
ffmpeg -y -i "$inputPath" -c:v libvpx-vp9 -pass 1 -b:v 0 -crf 33 -threads 8 -speed 4 \
  -tile-columns 6 -frame-parallel 1 \
  -an -f webm /dev/null

ffmpeg -y -i "$inputPath" -c:v libvpx-vp9 -pass 2 -b:v 0 -crf 33 -threads 8 -speed 2 \
  -vf "${cropFilter}, ${scaleFilter}" \
  -tile-columns 6 -frame-parallel 1 -auto-alt-ref 1 -lag-in-frames 25 \
  -c:a libopus -b:a 64k -f webm "${inputPathWithoutExtension}-COMPRESSED.webm"

# Create Mp4
ffmpeg -y -i "$inputPath" -vcodec libx264 -pix_fmt yuv420p -profile:v baseline -level 3 \
  -vf "${cropFilter}, ${scaleFilter}" \
  -an "${inputPathWithoutExtension}-COMPRESSED.mp4"