import { describe, expect, it } from 'vitest';

import { fetchRoute } from './helpers';

describe('site routes', () => {
	it('renders the home page with hero content', async () => {
		const response = await fetchRoute('/');
		expect(response.status).toBe(200);

		const html = await response.text();
		expect(html).toContain('Jereko');
		expect(html).toContain('Thanks for the visit!');
	});

	it('renders the projects page', async () => {
		const response = await fetchRoute('/projects');
		expect(response.status).toBe(200);

		const html = await response.text();
		expect(html).toContain('Projects');
		expect(html).toContain('OpenStack');
	});

	it('renders the experience page', async () => {
		const response = await fetchRoute('/experience');
		expect(response.status).toBe(200);

		const html = await response.text();
		expect(html).toContain('Experience');
	});

	it('returns 404 for unknown pages', async () => {
		const response = await fetchRoute('/this-page-does-not-exist');
		expect(response.status).toBe(404);

		const html = await response.text();
		expect(html).toContain('404');
		expect(html).toContain('Page not found.');
	});
});

describe('site navigation', () => {
	it('includes primary nav links in the HTML shell', async () => {
		const html = await (await fetchRoute('/')).text();

		expect(html).toContain('href="/projects"');
		expect(html).toContain('href="/experience"');
		expect(html).toContain('href="/about-me"');
	});

	it('injects route-specific document title', async () => {
		const html = await (await fetchRoute('/about-me/hobbies')).text();
		expect(html).toContain('<title>Hobbies | Jereko</title>');
	});
});

describe('offline page', () => {
	it('is reachable for the PWA fallback route', async () => {
		const response = await fetchRoute('/offline');
		expect(response.status).toBe(200);

		const html = await response.text();
		expect(html).toContain('Offline');
	});
});
