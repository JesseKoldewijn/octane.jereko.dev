import { createRouter, createRootRoute, createRoute } from '@octanejs/tanstack-router';
import { EmptyPage } from './EmptyPage.tsrx';
import { NotFound } from '../pages/NotFound.tsrx';

export interface RouterEnv {
	history?: unknown;
	isServer?: boolean;
}

export function makeRouter(env: RouterEnv = {}) {
	const rootRoute = createRootRoute({
		component: EmptyPage,
		notFoundComponent: NotFound,
	});

	const indexRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: '/',
		component: EmptyPage,
	});

	const projectsRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: 'projects',
		component: EmptyPage,
	});

	const experienceRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: 'experience',
		component: EmptyPage,
	});

	const aboutMeRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: 'about-me',
		component: EmptyPage,
	});

	const aboutMeHobbiesRoute = createRoute({
		getParentRoute: () => aboutMeRoute,
		path: 'hobbies',
		component: EmptyPage,
	});

	const aboutMeVolunteeringRoute = createRoute({
		getParentRoute: () => aboutMeRoute,
		path: 'volunteering',
		component: EmptyPage,
	});

	const offlineRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: 'offline',
		component: EmptyPage,
	});

	return createRouter({
		routeTree: rootRoute.addChildren([
			indexRoute,
			projectsRoute,
			experienceRoute,
			aboutMeRoute.addChildren([aboutMeHobbiesRoute, aboutMeVolunteeringRoute]),
			offlineRoute,
		]),
		history: env.history,
		isServer: env.isServer,
		scrollRestoration: true,
	});
}
