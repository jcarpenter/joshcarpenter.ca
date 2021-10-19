---
title: "Chrome VR"
tags: [ux]
publish: true
image: "img/chromevr/chromevr-2d-screenshot.png"
summary: "TODO"
---

_2016/17_{.timeframe} – Chrome VR was a virtual reality version of Chrome for Android, designed for Google's [Daydream](https://en.wikipedia.org/wiki/Google_Daydream) VR platform. I joined Google in 2016 as UX Lead for the project. Before Google, I'd spent a two years at Mozilla prototyping VR browsers, and so I was extremely excited to apply those learnings to a real product. As the solo designer, I was responsible for interaction/visual design, and prototyping. In late 2017 [Gordon Brander](https://gordonbrander.com/) took over design responsibilities and finished the project.

<figure>
        <video playsinline autoplay loop muted>
                <source src="img/chromevr/chromevr-2d-browsing.webm" type="video/webm; codecs=vp9,opus"></source>
                <source src="img/chromevr/chromevr-2d-browsing.mp4" type="video/mp4"></source>
        </video>
        <figcaption>Browsing traditional 2D content</figcaption>
</figure>

Our primary design challenge was adapting the conventions of traditional browsing to the affordances of Daydream's low-resolution displays and laser pointer-style controllers. Text and buttons needed to be larger, relative to content, in order to be legible and accessible. This limited how much UI could be displayed concurrently, requiring new approaches to common browsing tasks such as managing tabs, entering URLs, and switching to Incognito mode. These new solutions had to both be effective within VR, and conform to Chrome for Android conventions, so that VR and mobile felt cohesive (particularly important on Daydream, where users could switch between VR and mobile in an instant, by simply removing their phone from the Daydream headset).

<figure>
        <video playsinline autoplay loop muted>
                <source src="img/chromevr/chromevr-webvr.webm" type="video/webm; codecs=vp9,opus"></source>
                <source src="img/chromevr/chromevr-webvr.mp4" type="video/mp4"></source>
        </video>
        <figcaption>Acccessing VR content</figcaption>
</figure>

Throughout the design process, prototyping and user testing were our best friends, helping us iterate towards effective solutions. Prototypes were built in a mix of Unity, WebVR, and Chrome VR itself, which used a new 3D UI stack built by Chrome engineers.

<figure>
        <video playsinline autoplay loop muted>
                <source src="img/chromevr/chromevr-cinema-mode.webm" type="video/webm; codecs=vp9,opus"></source>
                <source src="img/chromevr/chromevr-cinema-mode.mp4" type="video/mp4"></source>
        </video>
        <figcaption>Viewing media content in "Cinema Mode"</figcaption>
</figure>

The key meta challenge of the project was incubating a new product for a small audience within a mature product for a billion plus users. Our team's top priorities were validating a new VR user experience and UI stack. To do that as fast as possible, we wanted to iterate rapidly in-market with real user feedback, by shipping often and keeping initial feature set minimal. But the Chrome organization understandably prioritized shipping a bug free, highly-optimized mobile browser to a billion-plus Android users. And required UX conformity across mobile and VR, for both consistency and legal reasons (e.g. needing to show prompts in certain regions for regulatory reasons). By building Chrome VR inside the larger Chrome organization and codebase, we inherited world-class technical foundations and processes, but at the cost of development velocity. Chrome VR would ideally have shipped as a launch title with Daydream on November 2016. Instead it shipped in summer 2018—after the internal announcement that the Daydream platform had being cancelled.

<figure>
        <video playsinline autoplay loop muted>
                <source src="img/chromevr/chromevr-tabs.webm" type="video/webm; codecs=vp9,opus"></source>
                <source src="img/chromevr/chromevr-tabs.mp4" type="video/mp4"></source>
        </video>
        <figcaption>Accessing tabs</figcaption>
</figure>
