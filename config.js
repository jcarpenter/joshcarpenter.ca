const meta = {
  title_suffix: " | Josh Carpenter",
  url: "https://joshcarpenter.ca",
  summary: "TODO",
  default_image: {
    url: "jc.png",
    width: 1200,
    height: 1200
  }
}

const responsive_images = {
  format: "jpeg",
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
  sizes_attribute: "(min-width: 600px) 572px, 90vw"
}

const bio = {
  name: "Josh Carpenter",
  twitter: "joshcarpenter",
  email: "josh@joshcarpenter.ca",
  linkedin: "https://www.linkedin.com/in/josh-carpenter-3575133"
}

module.exports.meta = meta
module.exports.responsive_images = responsive_images
module.exports.bio = bio
