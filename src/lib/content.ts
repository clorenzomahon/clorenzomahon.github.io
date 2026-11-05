import { getCollection } from "astro:content";

/** Drafts are visible in `npm run dev` and never included in a production build. */
const isVisible = ({ data }: { data: { draft: boolean } }) =>
	import.meta.env.DEV || !data.draft;

export async function getProjects() {
	const projects = await getCollection("projects", isVisible);
	return projects.filter(({ data }) => !data.hidden).sort((a, b) => a.data.order - b.data.order);
}

export async function getPosts() {
	const posts = await getCollection("blog", isVisible);
	return posts.sort(
		(a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
	);
}

export function readingTime(body = "") {
	const words = body.trim().split(/\s+/).filter(Boolean).length;
	return `${Math.max(1, Math.round(words / 200))} min read`;
}

export function formatDate(date: Date) {
	return new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}
