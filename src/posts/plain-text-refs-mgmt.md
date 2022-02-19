---
title: "Plaintext references management with Markdown and Zotero"
tags: [post, web, tutorial]
post_layout: "large"
publish: true
permalink: "/plain-text-references-management/"
summary: "My workflow for capturing and managing research references without reliance on closed apps or services."
# meta_image: "img/thwaites-1.jpg"
date: 2021-02-18
layout: "post-wrapper.njk"
---

<figure class="splash">
        <video playsinline autoplay loop muted data-lightbox poster="/img/plain-text-refs-mgmt/workflow-poster.png">
            <source src="/video/plain-text-refs-mgmt/workflow.webm" type="video/webm; codecs=vp9,opus"></source>
            <source src="/video/plain-text-refs-mgmt/workflow.mp4" type="video/mp4"></source>
        </video>
        <figcaption class="caption-clr small-text"><strong>The workflow</strong>: Capturing references with <a href="https://www.zotero.org/">Zotero</a>, citing them in Markdown notes, and then publishing to the web. We'll cover publishing in a later post.</figcaption>
</figure>

## The need for better tools {.hide}

In 2019 I decided to learn more climate change. As I read and took notes, I tried to track my sources, usually by pasting a URL next to this fact or that figure. But I quickly realized this wouldn't scale: ad hoc citations were quickly cluttering up my documents; I was inconsistent about what information I captured; and there was no centralized system for managing shared references across documents. 

I needed a workflow that let me 1) easily capture references, 2) with full metadata (e.g. author, date, title, url), 3) into a distinct, canonical repository, and then 4) easily insert citations into my notes. 

I also wanted this workflow to be based on plain text formats. That way I'd retain control over my data, and not be limited by third-party apps or services. I knew I eventually wanted to build a scripted publishing pipeline for my notes, and using plain formats like JSON and Markdown would be possible. Keeping my data out of proprietary apps and services also ensured longevity; I wouldn't have to worry about my work being stuck in with a company that might disappear, or change business models, etc.

After fussing with various tools, I arrived at the following workflow for capturing and managing references. It's not perfect, but it checks the above boxes, and I'm using it with hundreds of references and dozens of notes. In a future post I'll share my workflow for publishing documents and references to the web.

### At a high level, my workflow looks like the following

1. Capture and manage references with [Zotero](https://www.zotero.org/). Each reference receives a unique "citation key" ID.
1. Write notes in Markdown.^[I use the [GitHub Flavored Markdown spec](https://github.github.com/gfm/) syntax, plus a few [Pandoc Markdown](https://pandoc.org/MANUAL.html#pandocs-markdown) extensions for [footnotes](https://pandoc.org/MANUAL.html#footnotes), [implicit figures](https://pandoc.org/MANUAL.html#extension-implicit_figures), and [citations](https://pandoc.org/MANUAL.html#citation-syntax).] 
1. Create citations in Markdown notes by pasting in citation keys, wrapped in square brackets.
1. Publish notes to the web, with citations rendered inline, using [Eleventy](https://www.11ty.dev/) and [Citeproc](https://github.com/jgm/citeproc).

The steps to recreate the workflow are as follows.


## Step 1: Install Zotero

![My climate change references in Zotero](/img/plain-text-refs-mgmt/zotero-mainscreen.png)

[Zotero](https://www.zotero.org) is a free open-source desktop app for managing research references. Each reference is stored as an _item_ with detailed metadata such as title, author, year published, etc. Zotero includes tools for capturing references for books, reports, websites, and more. It's available for [Mac, Linux and Windows](https://www.zotero.org/download/).


## Step 2: Install Better BibTeX

Better BibTeX (BBT) is an extension for Zotero that adds powerful features for text-based workflows.

1. Download the [latest Better BibTex release](https://retorque.re/zotero-better-bibtex/installation/)
1. In Zotero, under `Tools > Add-ons`, select `Install Add-on From File` from the gear icon in top-right, and the select the downloaded Better BibTeX .xpi file.
1. Restart Zotero. When it re-opens the Better BibTeX setup wizard will appear. Confirm the default options.


## Step 3: Set Zotero preferences

{%- from "../includes/gallery.njk" import gallery -%}

{{ gallery({
        images: [
                "/img/plain-text-refs-mgmt/zotero-prefs-bbt-citationkeys.png",
                "/img/plain-text-refs-mgmt/zotero-prefs-bbt-export-bibtex.png",
                "/img/plain-text-refs-mgmt/zotero-prefs-bbt-export-biblatex.png",
                "/img/plain-text-refs-mgmt/zotero-prefs-bbt-export-fields.png",
                "/img/plain-text-refs-mgmt/zotero-prefs-bbt-export-quickcopy.png",
                "/img/plain-text-refs-mgmt/zotero-prefs-bbt-export-postscript.png",
                "/img/plain-text-refs-mgmt/zotero-prefs-bbt-export-misc.png",
                "/img/plain-text-refs-mgmt/zotero-prefs-bbt-automaticexport.png",
                "/img/plain-text-refs-mgmt/zotero-prefs-bbt-import.png",
                "/img/plain-text-refs-mgmt/zotero-prefs-bbt-miscellaneous-fields.png",
                "/img/plain-text-refs-mgmt/zotero-prefs-bbt-miscellaneous-stringdefinitions.png",
                "/img/plain-text-refs-mgmt/zotero-prefs-export.png"
        ],
        backgroundColor: "#8F8F8F",
        caption: "My Zotero preferences"
}) }}

Zotero and Better BibTeX have a long list of options that we can configure. The screenshots above show my exact preferences for the important preferences sections. But the essential options are as follows:

<div class="table cols-3">
        <div class="row head">
                <span>Preferences tab</span>
                <span>Option</span>
                <span>Set to</span>
        </div>
        <div class="row full-width section">
                <span>Better BibTeX</span>
        </div>
        <div class="row">
                <span>Citation keys</span>
                <span>Force citation key to plain text</span>
                <span><code>Check</code></span>
        </div>
        <div class="row">
                <span>Citation keys</span>
                <span>Keep keys unique</span>
                <span><code>Within each library</code></span>
        </div>
        <div class="row">
                <span>Export > BibTeX</span>
                <span>Export unicode as plain-text latext commands</span>
                <span><code>Check</code></span>
        </div>
        <div class="row">
                <span>Export > Quick-Copy</span>
                <span>Quick-Copy format</span>
                <span><code>Cite Keys</code></span>
        </div>
        <div class="row">
                <span>Export > Miscellaneous</span>
                <span>Apply title-casing to titles</span>
                <span><code>Check</code></span>
        </div>
        <div class="row">
                <span>Automatic export</span>
                <span>Automatic export</span>
                <span><code>On Change</code></span>
        </div>
        <div class="row full-width section">
                <span>Export</span>
        </div>
        <div class="row">
                <span></span>
                <span>Default Format</span>
                <span><code>Better BibTeX Quick Copy</code></span>
        </div>
</div>


## Step 4: Export our references to JSON

```json
{"id":"blog-Block-WhatIt-17","accessed":{"date-parts":[[2019,11,9]]},"author":[{"family":"Block","given":"Erin"}],"citation-key":"blog-Block-WhatIt-17","container-title":"Waterstudio","issued":{"date-parts":[[2017,9,22]]},"language":"en","title":"What It Takes to Make a Brand New Island","type":"post-weblog","URL":"https://www.waterstudio.nl/what-it-takes-to-make-a-brand-new-island/"}
```

We need to export our Zotero library to JSON so that later on, in the publishing step, we can use this JSON—along with our Markdown notes—to render our notes as HTML, along with references rendered as citations and/or bibliographies. Once exported, Zotero will automatically update the JSON whenver we make a change. 

1. Select `File > Export Library`
1. Set `Format` to _Better CSL JSON_, and check `Keep updated` in export options.
1. Name and save the file.


## Step 5: Capture references!

![Using [Zotero Connector](https://www.zotero.org/download/connectors) to capture an article from Chrome. The Connector has automatically filled out all the fields for us.](/img/plain-text-refs-mgmt/zotero-connector.png)

In addition to manually creating references using `File > New Item`, we can automatically generate detailed references from the web or publications with the following tools:

### Add websites from the browser

If you create references from websites, the [Zotero Connector](https://www.zotero.org/download/connectors) browser extension is a must-have time saver. It lives as a button in the browser toolbar, and when clicked saves a detailed reference for the current site, complete with  a "snapshot" offline capture of the page. Per the [docs](https://www.zotero.org/support/quick_start_guide#capturing_items):

> With the click of a button, [Zotero](https://www.zotero.org/) can automatically create an item of the appropriate type and populate the metadata fields, download a full-text PDF if available, and attach useful links...

### Add books, papers, articles (etc) by publication identifier

Enter an ISBN, DOI, PMID, or arXiv ID into the **Add Item(s) by Identifier** tool and Zotero will create a detaiked reference for the publication. This is a huge time saver. Look for a toolbar button that looks like a wand (for some reason there's no menu command).


## Step 6: Cite references in Markdown

![Citation keys (in pink) in a Markdown document](/img/plain-text-refs-mgmt/markdown-citationkeys-2.png)

As we create references ("items", in Zotero parlance), each item is assigned a unique **Citation Key**. To create a citation in Markdown, we paste the reference's citation key, preceded by an ampersand, and wrapped in square brackets. For example, if our reference's citation key is `brandWholeEarth`, we enter `[@brandWholeEarth]` in our Markdown note.

To specify where in the reference our citation comes from, we can optionally add a **locator**: `[@brandWholeEarth, p. 67]`. There are locators for chapter, figure, page, section, etc.^[Your available locators are determined by which [Locale](https://github.com/citation-style-language/locales) you choose to use, when we come to the publish step.] For more information on the citation key syntax, see the Pandoc Markdown [citation extension documentation](https://pandoc.org/MANUAL.html#citation-syntax).

### Copy citation keys with Cmd-Shift-C

To copy citation keys from Zotero, select one or more references in the library and hit `Cmd-Shift-C` (Mac). This will copy the citation key(s) to the clipboard, and we can then paste them into our notes. Alternatively, we can drag and drop references from Zotero into our notes. For these features to work, we need to set the following preferences (which we already did in Step 3):

* Export > Default Format > Better BibTeX Quick Copy: `Cite Keys`
* Better BibTeX > Export > Quick Copy > Quick-Copy format: `Cite Keys`

::: .caution
Editing items in Zotero _after_ citing them in Markdown may break the citations. By default, when we edit an item in Zotero, BBT automatically updates the citation key. If the key changes and we've already used the old version, the citation will break at publish time unless we first manually update it. To help avoid this, BBT has a feature wherein we can fix ("pin") individual keys, so they don't change when we edit their items. See the [BBT docs](https://retorque.re/zotero-better-bibtex/citing/#set-your-own-fixed-citation-keys) for details.
:::


## Recommended: "Cite as you write" with the citation picker

<figure>
        <video playsinline autoplay loop muted data-lightbox poster="/img/plain-text-refs-mgmt/citation-pick-1-poster.png">
                <source src="/video/plain-text-refs-mgmt/citation-pick-1.webm" type="video/webm; codecs=vp9,opus"></source>
                <source src="/video/plain-text-refs-mgmt/citation-pick-1.mp4" type="video/mp4"></source>
        </video>
        <figcaption class="caption-clr small-text">Grabbing references from Zotero without leaving the text editor.</figcaption>
</figure>

The fastest way to create citations is using the Zotero citation picker. It lets you bring up a Zotero search bar, find a citation, and insert it into your document—as from inside your text editor, without switching apps. There are [versions](https://retorque.re/zotero-better-bibtex/citing/cayw/) of the picker available for specific apps, but I prefer to use a global shortcut that lets me access the picker from any app.

![Creating a citation picker shortcut in Automator](/img/plain-text-refs-mgmt/zotero-citation-picker-automator.png)

To create a global citation picker shortcut on Mac, we'll use Automator and some AppleScript:

1. Open Automator app. `File > New`. Select document type **Quick Action**. 
1. In our new action, set `Workflow receives current` option to `no input`. 
1. Add a `Run AppleScript` action by dragging from `Library > Utilities`.
1. Paste the contents of [this AppleScript file](https://github.com/jcarpenter/zotpick-applescript/blob/master/zotpick-pandoc.applescript) into AppleScript action's text area. Delete the placeholder script.^[Credit to [Dave Smith](https://www.davidsmith.name/) for his [zotpick-applescript](https://github.com/davepwsmith/zotpick-applescript) repo. My [fork](https://github.com/jcarpenter/zotpick-applescript/blob/master/zotpick-pandoc.applescript) just adds a `brackets` parameter.]
1. Save the quick action. Give it a name when prompted.^[Automator actions are saved to `user/Library/Services`].
1. Give it a try! First make sure Zotero is open and Better BibTeX is installed. ^[The citation picker is enabled by Better BibTeX's [Cite as You Write](https://retorque.re/zotero-better-bibtex/citing/cayw/) feature.]. Open your text editing app. Trigger the quick action by selecting it from the Services menu, inside the app menu. 
1. At this point you'll probably be prompted to grant permissions to some combination of Automator, your text editing app, and possibly Script Editor and/or the AppleScript Utility.^[Modern Apple still enables automation workflows on the Mac platform, but it wraps them in lots of permissions.]. These permissions can be managed from ` Preferences > Security & Privacy > Accessibility`. Note that you have the click the lock icon in the lower left of the preferences window before you can make changes.
1. Once permissions are granted, re-run the action from inside your text editor. A red search bar should appear. Start to type, and matching references should auto-complete. Select a reference (or multiple), and hit Enter. The reference citation key(s) will be inserted into your document, at the cursor. 

In my experience this can be a tad rickety, mostly due to permissions issues, but when it works, it's fantastic. I have hit an issue using it from VS Code ^[Due to a known VS Code [Info.plist issue](https://github.com/microsoft/vscode/issues/46762) on Mac, the script will try to paste the selected key into Electron, instead of VS Code], so if you're editing your notes in Code, I'd recommend using the [dedicated extension](https://marketplace.visualstudio.com/items?itemName=mblode.zotero) instead.

## Recommended: Make your citation keys more descriptive

I find the citation keys that Zotero/Better BibTeX generates a bit hard to make sense of, at a glance. I prefer citation keys where the type and title are emphasized, even if the resulting key is a bit longer. Luckily we can customize the citation keys. With my settings, keys look like the following:

<div class="table cols-2">
        <div class="row head">
                <span>If reference type is...</span>
                <span>Citation key looks like...</span>
        </div>
        <div class="row">
                <span>Blog Post</span>
                <span><code>blog-Rushkoff-SurvivalRichest-19</code></span>
        </div>
        <div class="row">
                <span>Book</span>
                <span><code>book-UninhabitableEarthLife</code></span>
        </div>
        <div class="row">
                <span>Encyclopedia Article</span>
                <span><code>wiki-HurricaneMaria</code></span>
        </div>
        <div class="row">
                <span>Newspaper</span>
                <span><code>np-AntarcticIce-WP-ju18</code></span>
        </div>
        <div class="row">
                <span>Podcast</span>
                <span><code>pod-RipplesPond-Fault</code></span>
        </div>
        <div class="row">
                <span>Report</span>
                <span><code>rep-ClimateChange-15</code></span>
        </div>
        <div class="row">
                <span>Web Page</span>
                <span><code>web-FloodingNuclearPlant-15</code></span>
        </div>
</div>

To customize the pattern, in Preferences we go into Better BibTeX > Citation Keys and edit the text string under **Citation key format**. The default pattern is `[auth:lower][shorttitle3_3][year]`. In Better BibTeX's citation key generator syntax, that means:

* Last name of the first author, lowercase
* First three words of the title, capitalized
* Year of publication in 4 digits

With this default pattern, the citation key for Jesse Schell's 2008 book, [The Art of Game Design](https://www.schellgames.com/art-of-game-design/) would be `schellTheArtOf2008`

 My custom pattern is:

```markup
[=blogPost]blog-[auth]-[shorttitle2_2:skipwords:nopunctordash]-[shortyear] | [=book]book-[shorttitle3_3:skipwords:nopunctordash] | [=conferencePaper]conf-[shorttitle3_3:skipwords:nopunctordash][shortyear:prefix=-] | [=journalArticle]jrnl-[shorttitle3_3:skipwords:nopunctordash][shortyear:prefix=-] | [=encyclopediaArticle][LibraryCatalog:substring=1,4:lower]-[shorttitle3_3:skipwords:nopunctordash] | [=magazineArticle]mag-[shorttitle3_3:skipwords:nopunctordash][shortyear:prefix=-] | [=newspaperArticle]np-[shorttitle2_2:skipwords:nopunctordash]-[PublicationTitle:skipwords:nopunctordash:abbr]-[month:substring=1,2:lower][shortyear] | [=podcast]pod-[shorttitle2_2:skipwords:nopunctordash]-[SeriesTitle:substring=1,5:skipwords:nopunctordash] | [=report]rep-[shorttitle2_2:skipwords:nopunctordash]-[shortyear] |[=videoRecording]vid-[shorttitle2_2:skipwords:nopunctordash]-[SeriesTitle:abbr:postfix=-][shortyear] | [=webPage]web-[shorttitle3_3:skipwords:nopunctordash][shortyear:prefix=-] | [shorttitle3_3:skipwords:lower][shortyear:prefix=-]
```

That's a lot to parse. Essentially each reference type is getting a slightly different pattern (because I'm fussy), with patterns separated by vertical bars. Better BibTeX generator patterns are made up of functions and fitlers. Per the [docs](https://retorque.re/zotero-better-bibtex/citing/#generating-citekeys), "...functions grab text from your item, and filters transform that text." 

If we look the first pattern above, `[=blogPost]blog-[auth]-[shorttitle2_2:skipwords:nopunctordash]-[shortyear]`, it means:  “If reference is type is Blog Post, start with string 'blog-', then authors last name, then a dash, then title of the post with some [filters](https://retorque.re/zotero-better-bibtex/citing/#filters) applied (remove common words such as 'the' and 'of', as well as punctuation and dashes), then another dash, and finally the last two digits of the publication year."


## Conclusion: It works! But the UX could be better.

<figure>
        <video playsinline autoplay loop muted data-lightbox poster="/img/plain-text-refs-mgmt/typora-citekeys-workflow-1-poster.png">
            <source src="/video/plain-text-refs-mgmt/typora-citekeys-workflow-1.webm" type="video/webm; codecs=vp9,opus"></source>
            <source src="/video/plain-text-refs-mgmt/typora-citekeys-workflow-1.mp4" type="video/mp4"></source>
        </video>
        <figcaption class="caption-clr small-text">A discrete citation key UX that I hacked together in <a href="https://typora.io">Typora</a>. Keys collapse until hovered over or clicked.</figcaption>
</figure>

This workflow is pretty good! Our references are properly managed, and because everything is in plain text, we control our own data. But the writing experience could be better. Citation keys quickly clutter our Markdown as we add citations. The whole point of Markdown is to _minimize_ the visual noise of HTML elements so that words have focus. It would be better if citation keys collapsed by default, previewed on hover, and became editable when clicked on. I hacked together an implementation of this using [Typora](https://typora.io/)^[Typora is built on Electron and enables us to write custom themes using CSS], but it's not ideal. It requires I wrap citation keys in otherwise-unnecessary `==` mark tags, and I generally prefer VSCode as my text editor ^[Collapsing citation keys in VSCode would be great, but it's not possible until it lands the ability to collapse ranges, per this [issue](https://github.com/microsoft/vscode/issues/50840).]. It would also be better if hovering showed the full reference; not just the citation key.

I was obsessed enough about nailing this workflow that I spent over a year building my own text editor with citations integration, but with a new baby in the family my spare time is suddenly short, and I'm not sure I'll ship the app. So for now I tolerate cluttered Markdown in VSCode.

In a follow up post, I'll show how we can publish our notes to the web, with citations rendered inline, using using Node, [Eleventy](https://www.11ty.dev/) and [Citeproc](https://github.com/jgm/citeproc).