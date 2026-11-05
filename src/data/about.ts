/** Content for the About page. Figures: Google Analytics, 2025. */

export const IMPACT = [
	{ figure: "1.6m", label: "users a year" },
	{ figure: "5.1m", label: "page views a year" },
	{ figure: "£10m+", label: "annual income supported" },
	{ figure: "65.12%", label: "donate-page conversion" },
];

/** Highlighted in purple, as the skills to notice first. */
export const CORE_SKILLS = ["Drupal 10/11", "WordPress", "React", "Node.js", "WCAG 2.2"];

export const SKILL_GROUPS = [
	{ title: "Front-end", items: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Astro", "Tailwind CSS"] },
	{ title: "Back-end & CMS", items: ["Drupal 10/11", "Twig", "Composer", "Drush", "PHP", "Node.js", "MySQL", "WordPress"] },
	{ title: "Workflow & AI", items: ["Git", "GitHub", "Docker", "OrbStack", "CI/CD pipelines", "Claude Code", "ChatGPT", "GitHub Copilot", "Cursor"] },
	{ title: "Design", items: ["UI design", "Figma", "Design systems", "Brand identity", "Adobe Creative Suite"] },
	{ title: "Accessibility", items: ["WCAG 2.2", "Inclusive design", "Accessibility testing", "WCAG training"] },
	{ title: "Performance, SEO & sustainability", items: ["Core Web Vitals", "Technical SEO", "AB Tasty", "Optimised media", "Greener hosting"] },
];

/**
 * The scrolling card stack, oldest first. Add or remove cards freely.
 * `badge` is an optional round logo sticker: a file in /public, its size in pixels and its alt text.
 * Set `fill` for a logo with its own background, so that fills the circle.
 * `colour` is the card colour, from the company's logo, so each brand has its moment. `ink`
 * is the text colour on it: whichever of #ffffff or #0e0e10 has the stronger contrast.
 * `sector` is an optional short label shown beside the card number.
 * `photo` is an optional image behind the card, under a colour overlay in the card's colour.
 * `photoSize` is its width and height in pixels, which reserves its space while it loads.
 * `photoPosition` picks which part shows when the photo is cropped (default: top).
 * `photoTint` is how strongly the card colour covers the photo, as a percentage (default 68).
 * Lower it for a photo that needs to show through more.
 * Wrap job titles in the body in <strong> tags to make them bold.
 */
export const MILESTONES: { year: string; colour: string; ink: string; sector?: string; title: string; body: string; badge?: { src: string; width: number; height: number; alt: string; fill?: boolean }; photo?: string; photoSize?: [number, number]; photoPosition?: string; photoTint?: number }[] = [
	{
		year: "2015",
		colour: "#e30613", // Sound Leisure red
		ink: "#ffffff",
		sector: "Manufacturing",
		title: "Igniting a passion for design",
		body: "During my first year of college, work experience at Sound Leisure Ltd turned into 6 weeks of paid work, and I was hooked.",
		badge: { src: "/images/sound-leisure-badge.svg", width: 716, height: 484, alt: "Sound Leisure logo" },
		photo: "/images/milestone-soundleisure-workshop.webp",
		photoSize: [900, 608],
	},
	{
		year: "2018",
		colour: "#17727e", // a deeper Adept teal
		ink: "#ffffff",
		sector: "Engineering",
		title: "Turning it into a career",
		body: "My first design job, as a <strong>Graphic Designer</strong> at Adept Consulting Engineers Ltd.",
		badge: { src: "/images/adept-badge.png", width: 300, height: 300, alt: "Adept logo", fill: true },
		photo: "/images/milestone-adept-warehouse.webp",
		photoSize: [900, 506],
		photoTint: 85, // keeps the small white text readable over this bright photo
	},
	{
		year: "2020",
		colour: "#17171a", // the site's dark panel, close to All Rounder's black
		ink: "#ffffff",
		sector: "E-commerce",
		title: "Moving up the ranks",
		body: "Stepping up to <strong>Middleweight Graphic Designer</strong> at All Rounder, and delving into WordPress development.",
		badge: { src: "/images/allrounder-badge.jpg", width: 447, height: 447, alt: "All Rounder Cricket logo" },
		photo: "/images/milestone-allrounder-cricket.webp",
		photoSize: [900, 506],
	},
	{
		year: "2021",
		colour: "#006b59", // a deeper MoreLife green, so its sticker stands out
		ink: "#ffffff",
		sector: "Healthcare",
		title: "Where design met code",
		body: "As <strong>Senior UI &amp; Brand Designer</strong> at MoreLife by Voy, I co-led a full WordPress rebuild, hand-coding custom components alongside the visual direction.",
		badge: { src: "/images/morelife-badge.png", width: 447, height: 447, alt: "MoreLife by Voy logo", fill: true },
		photo: "/images/milestone-morelife-jogger.webp",
		photoSize: [900, 675],
		photoTint: 80, // keeps the small white text readable over this bright photo
	},
	{
		year: "2023",
		colour: "#104080", // SVP navy
		ink: "#ffffff",
		sector: "Charity",
		title: "Making the switch",
		body: "As <strong>Senior Digital Designer &amp; Web Lead</strong> at St Vincent de Paul Society, I owned and developed a Drupal website and its 12 microsites.",
		badge: { src: "/images/svp-badge.webp", width: 400, height: 400, alt: "St Vincent de Paul Society logo" },
		photo: "/images/milestone-svp-shop.webp",
		photoSize: [900, 675],
		photoPosition: "50% 45%",
	},
	{
		year: "2024",
		colour: "#040444", // Open University navy
		ink: "#ffffff",
		sector: "Education",
		title: "Back to the books",
		body: "Started a <strong>BSc in Computing &amp; IT</strong> at The Open University, studying part-time alongside full-time work and due to finish in 2027.",
		badge: { src: "/images/open-university-badge.webp", width: 400, height: 400, alt: "The Open University logo" },
		photo: "/images/milestone-ou-studying.webp",
		photoSize: [900, 600],
		photoTint: 30,
	},
	{
		year: "2025",
		colour: "#c93b2b", // Salvation Army red
		ink: "#ffffff",
		sector: "Charity",
		title: "Building for impact",
		body: "As <strong>Senior Website Officer (Web Lead &amp; Front-End Developer)</strong> at The Salvation Army, I lead content development on the Drupal site behind £10m+ in annual income.",
		badge: { src: "/images/salvation-army-badge.svg", width: 260, height: 260, alt: "The Salvation Army logo" },
		photo: "/images/milestone-salvation-army-atrium.webp",
		photoSize: [900, 1200],
		photoPosition: "50% 55%",
	},
	{
		year: "2026",
		colour: "#a78bfa", // site purple: this one's all mine
		ink: "#0e0e10",
		sector: "Right now",
		title: "Going deeper",
		body: "Always learning, and currently deepening my knowledge of React, Node.js and TypeScript.",
		badge: { src: "/images/logo-black.svg", width: 826, height: 490, alt: "Cait Lorenzo-Mahon logo" },
		photo: "/images/milestone-next-circuit.webp",
		photoSize: [900, 665],
		photoTint: 85, // keeps the small dark text readable over this photo's dark areas
	},
];
