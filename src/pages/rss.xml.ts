import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "../data/site";
import { getPosts } from "../lib/content";

export async function GET(context: APIContext) {
	const posts = await getPosts();

	return rss({
		title: `${SITE.name}'s blog`,
		description: "Notes on building fast, accessible, sustainable websites.",
		site: context.site!,
		items: posts.map(({ id, data }) => ({
			title: data.title,
			description: data.metaDescription ?? data.excerpt,
			pubDate: data.publishedAt,
			link: `/blog/${id}/`,
		})),
	});
}
