const responsive_images = {
  format: 'jpeg',
  quality: 90,
  padding: 50,
  sizes: [
    {
      width: 600,
      suffix: "-sml",
      descriptor: "600w"
    },
    {
      width: 900,
      suffix: "-med",
      descriptor: "900w"
    },
    {
      width: 1440,
      suffix: "-lg",
      descriptor: "1440w"
    },
  ],
  sizes_attribute: '(min-width: 600px) 572px, 90vw'
}

module.exports.responsive_images = responsive_images
