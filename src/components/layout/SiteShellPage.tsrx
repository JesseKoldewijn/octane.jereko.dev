import { Home } from '@/pages/Home.tsrx';
import { Projects } from '@/pages/Projects.tsrx';
import { Experience } from '@/pages/Experience.tsrx';
import { AboutMe } from '@/pages/AboutMe.tsrx';
import { AboutMeHobbies } from '@/pages/AboutMeHobbies.tsrx';
import { AboutMeVolunteering } from '@/pages/AboutMeVolunteering.tsrx';
import { Offline } from '@/pages/Offline.tsrx';
import { NotFound } from '@/pages/NotFound.tsrx';

function normalizePathname(pathname: string) {
	const normalized =
		pathname.length > 1 && pathname.endsWith('/')
			? pathname.slice(0, -1)
			: pathname;
	return normalized;
}

/** Route pathname → page component. @if chain avoids @switch SSR/hydration block drift. */
export function SiteShellPage(props: { pathname: string }) @{
	const route = normalizePathname(props.pathname);

	@if (route === '/') {
		<Home />
	} @else if (route === '/projects') {
		<Projects />
	} @else if (route === '/experience') {
		<Experience />
	} @else if (route === '/about-me') {
		<AboutMe />
	} @else if (route === '/about-me/hobbies') {
		<AboutMeHobbies />
	} @else if (route === '/about-me/volunteering') {
		<AboutMeVolunteering />
	} @else if (route === '/offline') {
		<Offline />
	} @else {
		<NotFound />
	}
}
