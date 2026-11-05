import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Add a project: create src/content/projects/your-project.md
 * Add a post:    create src/content/blog/your-post.md
 *
 * The filename becomes the URL. Set `draft: true` to preview something in
 * `npm run dev` without publishing it.
 */

const projects = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		tags: z.array(z.string()).default([]),
		year: z.number().int().optional(),
		/** Lower numbers appear first. */
		order: z.number().default(100),
		/** Featured projects appear on the home page. */
		featured: z.boolean().default(false),
		/** Short label such as "In development", shown on the tile. */
		status: z.string().optional(),
		/** Path to a file in /public, e.g. /images/projects/cinesearch.webp */
		image: z.string().optional(),
		imageAlt: z.string().optional(),
		repo: z.url().optional(),
		live: z.url().optional(),
		/** Keeps the file but never lists or publishes the project, even in dev. */
		hidden: z.boolean().default(false),
		draft: z.boolean().default(false),
	}),
});

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		excerpt: z.string(),
		tag: z.string(),
		publishedAt: z.coerce.date(),
		/** The whole <title> in search results, when `title` is over 60 characters. */
		metaTitle: z.string().optional(),
		/** The search result text, when `excerpt` is short. Aim for 120 to 160 characters. */
		metaDescription: z.string().optional(),
		/** Path to a file in /public, 1200 x 630. Shown on the blog page and when shared. */
		image: z.string().optional(),
		imageAlt: z.string().optional(),
		/** A call to action shown straight after the post. */
		cta: z.object({ heading: z.string(), body: z.string() }).optional(),
		draft: z.boolean().default(false),
	}),
});

export const collections = { projects, blog };
