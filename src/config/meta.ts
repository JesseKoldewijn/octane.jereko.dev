export const SITE_URL = 'https://jereko.dev';

export interface PageMeta {
	title: string;
	description: string;
}

export const defaultMeta: PageMeta = {
	title: 'Jereko - My personal website | Jesse Koldewijn',
	description:
		'Personal website of Jesse Koldewijn showcasing projects, experience, volunteering work, and events attended.',
};

export const pageMeta: Record<string, PageMeta> = {
	'/': defaultMeta,
	'/projects': {
		title: 'Projects | Jereko',
		description:
			'Browse projects Jesse Koldewijn has built across web and software engineering, highlighting tools, technologies, and practical experience.',
	},
	'/experience': {
		title: 'Experience | Jereko',
		description:
			"Explore Jesse Koldewijn's professional experience across software engineering roles and education.",
	},
	'/about-me': {
		title: 'About me | Jereko',
		description:
			'Learn more about Jesse Koldewijn, his background in tech, and the interests that shaped his path in software engineering.',
	},
	'/about-me/hobbies': {
		title: 'Hobbies | Jereko',
		description:
			"Discover Jesse Koldewijn's hobbies and interests outside of software engineering.",
	},
	'/about-me/volunteering': {
		title: 'Volunteering | Jereko',
		description: "Read about Jesse Koldewijn's volunteering work as a GameLead for Stack Up.",
	},
	'/offline': {
		title: 'Offline - Jereko',
		description:
			'Offline status page for Jereko. Reconnect to the internet and refresh to continue browsing the site.',
	},
};

export function getMetaForPath(pathname: string): PageMeta {
	const normalized =
		pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
	return (
		pageMeta[normalized] ?? {
			title: '404 | Jereko',
			description: 'The page you are looking for could not be found on Jereko.',
		}
	);
}
