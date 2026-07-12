/** Routes prerendered to static HTML at build time. */
export const PRERENDER_ROUTES = [
	'/',
	'/projects',
	'/experience',
	'/about-me',
	'/about-me/hobbies',
	'/about-me/volunteering',
	'/offline',
] as const;

/** Routes included in public/sitemap.xml (excludes utility pages). */
export const SITEMAP_ROUTES = PRERENDER_ROUTES.filter((route) => route !== '/offline');

export type PrerenderRoute = (typeof PRERENDER_ROUTES)[number];
