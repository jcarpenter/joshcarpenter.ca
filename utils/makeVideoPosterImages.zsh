#!/bin/zsh

# Create JPEG poster images for one or more input videos
# Use like: 
# ./makeVideoPosterImages.zsh cat.mp4 dog.mp4 owl.mp4

# -vf "scale='min(1200, iw)':-1" --- Scale to 1200 pixels, and maintain aspect ratio. Do not upscale if source is less than 1200.
# -qscale:v 2 --- JPEG output quality. 1-31, where lower is better. Recommend values 2-5.
# -y --- Always overwrite
# -src_range 0 -dst_range 1 --- Help get JPEG color closer to source. Else is too dark. Per https://stackoverflow.com/a/38200935

videos=($@)

for i in $videos; 
    do ffmpeg -ss 00:00:00 -y -i "$i" -vf "scale='min(1200, iw)':-1" -qscale:v 2 -vframes 1 -src_range 0 -dst_range 1 "${i%.*}-poster.jpg"; 
done