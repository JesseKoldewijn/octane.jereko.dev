import { Home } from '../pages/Home.tsrx';
import { Projects } from '../pages/Projects.tsrx';
import { Experience } from '../pages/Experience.tsrx';
import { AboutMe } from '../pages/AboutMe.tsrx';
import { AboutMeHobbies } from '../pages/AboutMeHobbies.tsrx';
import { AboutMeVolunteering } from '../pages/AboutMeVolunteering.tsrx';
import { Offline } from '../pages/Offline.tsrx';

/** Map pathname to page component (kept in sync with routes in router.ts). */
export function pageForPathname(pathname: string) {
	const normalized =
		pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

	switch (normalized) {
		case '/':
			return Home;
		case '/projects':
			return Projects;
		case '/experience':
			return Experience;
		case '/about-me':
			return AboutMe;
		case '/about-me/hobbies':
			return AboutMeHobbies;
		case '/about-me/volunteering':
			return AboutMeVolunteering;
		case '/offline':
			return Offline;
		default:
			return null;
	}
}
