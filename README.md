# Cait Lorenzo-Mahon — Portfolio

Personal portfolio site for Cait Lorenzo-Mahon, Front End and Drupal Developer based in Yorkshire, UK.

**Live site:** [clorenzomahon.github.io](https://clorenzomahon.github.io)

## About

Designed by me, built with Claude Code, with every decision reviewed and directed by me. I was the product owner, designer and reviewer: setting the direction, shaping the design and checking every change.

## Tech stack

- [Astro](https://astro.build), with TypeScript and plain CSS
- Markdown content for blog posts and projects
- Web3Forms for the CV request form
- Hosted on GitHub Pages, built and deployed with GitHub Actions

## What it does well

- **Light:** the home page loads in under 60 KB, with no third-party scripts or trackers
- **Accessible:** built to WCAG 2.2 AA, with keyboard support, a skip link and reduced-motion support
- **Private:** no analytics, advertising or cookies

## Running it locally

```sh
npm install
npm run dev     # http://localhost:4321
npm run build   # builds the site into dist/
```

## Adding content

- **Blog post:** add a Markdown file to `src/content/blog/`. The filename becomes the URL.
- **Project:** add a Markdown file to `src/content/projects/`.
- Set `draft: true` to preview something locally without publishing it.
