---
title: Why I build "light" web architecture (and how my code cuts down carbon)
excerpt: Every page load has a literal carbon footprint.
tag: Sustainability
publishedAt: 2026-11-05
metaTitle: Why I Build Light Websites to Cut Carbon
metaDescription: Every page load has a carbon footprint. Here's how I build lighter websites, what that saves, and where my own site still falls short.
image: /images/blog/why-i-build-light-websites.png
cta:
  heading: Want a faster, lighter website?
  body: Whether you'd like to make your own site faster and lighter, or you're looking for a developer who cares about this stuff, I'd love to hear from you.
---

We talk about "the cloud" as if websites float about somewhere in the stratosphere, weightless and harmless. They don't. The internet is a huge network of very real, power-hungry machines, and every visit wakes some of them up.

I came to code from [years as a Senior Graphic Designer](/about/), where you learn that everything on a page should earn its place. I still think that way, only now I'm also counting what each thing weighs. I care about making the web lighter on the planet, whether that's trimming a bloated page or dealing with the 23MB image someone just uploaded.

## What I mean by "website carbon"

Website carbon is the greenhouse gas from the electricity it takes to deliver and display a site. A big part of that comes down to page weight: the total size of everything your visitor has to download.

Pages keep getting heavier. HTTP Archive's [2024 Web Almanac](https://almanac.httparchive.org/en/2024/page-weight) puts the median mobile page at 2,311 KB, up from about 505 KB in 2014. That's more than four times the size in ten years.

[Website Carbon](https://www.websitecarbon.com/) estimates that the average web page produces about 0.36g of CO₂ per view. That sounds tiny until you scale it up over a year:

- **10,000 monthly views:** about 43kg of CO₂, roughly a Great Dane.
- **100,000 monthly views:** about 430kg, roughly a grand piano.
- **1,000,000 monthly views:** about 4.3 tonnes, roughly three Minis.

This isn't abstract for me. The Salvation Army site I look after gets around 5.1m page views a year. I haven't measured its footprint for this post, but at that average it would be about 1.8 tonnes of CO₂ a year, so every 10% I could take off would save roughly 180kg. Small changes add up quickly at that scale.

## Lighter sites are usually better sites

A lighter site tends to help in other ways too:

- **Speed:** less to download means faster pages and a better shot at good Core Web Vitals. They won't win you rankings on their own, though. [Google says](https://developers.google.com/search/docs/appearance/page-experience) good scores don't guarantee top results, and relevant content comes first.
- **Conversions:** a slow page gives people a reason to leave, so speed removes one more thing standing between them and what they came to do.
- **Inclusivity:** light pages work better on older phones, tight data plans and patchy signal, which is who a heavy site quietly leaves behind.

## How I keep things light

Most page bloat comes from images, scripts and clutter, so that's where I start.

1. **I automate images.** I don't want a site's weight to depend on someone remembering to compress a file. I set up WebP/AVIF responsive image styles in the CMS and native lazy-loading in the templates, so that 23MB upload never reaches a visitor at full size.
2. **I watch the JavaScript.** Heavy scripts keep your visitor's device working hard long after the download finishes. I trim unused CSS and JavaScript, move heavy work back to server-side caching where I can, and use plain HTML and CSS before reaching for a client-side framework.
3. **I look at hosting.** Where a site is hosted affects its footprint too, which brings me to where I fall short.

## Practising what I preach (mostly)

I built [this site](/work/this-portfolio/) to the same rules, so here are its real numbers. Website Carbon rates it A+, at 0.02g of CO₂ per page view, cleaner than 97% of web pages globally.

The format change alone makes a big difference. My 560px headshot is 63 KB as a JPEG and 19 KB as a WebP, the same picture at about 70% less weight.

On a phone, the home page weighs 42 KB on first view, against that 2,311 KB median. On a bigger screen it's 53 KB, because it adds an 11 KB still of the little figure hiding in the hero. There's no room for her on small screens, so phones never download her. If you find her with the light, she walks for as long as it stays on her, unless you've asked your device to reduce motion. That animation is 292 KB, more than five times the rest of the page, so it only downloads if you go looking for her. I decided it was worth it. A portfolio should have some personality, and being light doesn't mean being boring, but it's a real cost and I'd rather show it than hide it.

Hosting is the other gap. This site runs on GitHub Pages, and when Website Carbon last tested it, the report said it uses "bog standard energy". So I can't claim this site is green from top to bottom.

That's the honest version of sustainable web work. You won't hit zero on day one. You make better choices, one image, one plugin and one line of code at a time, and you stay honest about the ones you've traded off.

## Four things you can do today

1. **Test a page.** Run it through [Website Carbon](https://www.websitecarbon.com/) to get a starting point.
2. **Find your biggest file.** Open your browser's dev tools, go to the Network tab, reload and sort by size. Whatever's at the top is usually your quickest win.
3. **Lazy-load images further down the page.** Add `loading="lazy"` to them, but leave it off the main image at the top, as it will make that load later.
4. **Check your host.** The [Green Web Foundation's directory](https://www.thegreenwebfoundation.org/directory/) lists hosting providers that run on green energy.
