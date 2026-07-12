import { describe, expect, it } from 'vitest';

import { e2eBaseUrl, fetchRoute } from './helpers';

async function readClientEntryFromSite(): Promise<string> {
	const html = await (await fetchRoute('/')).text();
	const match = html.match(/<script[^>]+src="(\/assets\/index-[^"]+\.js)"/i);
	expect(match?.[1]).toBeTruthy();

	const scriptUrl = new URL(match![1]!, e2eBaseUrl());
	const response = await fetch(scriptUrl);
	expect(response.ok).toBe(true);

	return response.text();
}

describe('site routes', () => {
	it('renders the home page with hero content', async () => {
		const response = await fetchRoute('/');
		expect(response.status).toBe(200);

		const html = await response.text();
		expect(html).toContain('Jereko');
		expect(html).toContain('Thanks for the visit!');
		expect(html).not.toMatch(/rel=["']modulepreload["']/i);
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

describe('client bundle', () => {
	it('does not create a circular App chunk import back into the hydrate entry', async () => {
		const indexSource = await readClientEntryFromSite();
		const appMatch = indexSource.match(/import\(`\.\/(App-[^`]+\.js)`\)/);
		expect(appMatch?.[1]).toBeTruthy();

		const appSource = await fetch(new URL(`/assets/${appMatch![1]!}`, e2eBaseUrl())).then(
			(response) => response.text(),
		);

		expect(appSource).not.toMatch(/from"\.\/index-[^"]+"/);
		expect([...appSource.matchAll(/import\([^)]+\)/g)]).toHaveLength(0);
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
