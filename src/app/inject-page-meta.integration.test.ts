import type { Context } from '@octanejs/vite-plugin';
import { describe, expect, it } from 'vitest';

import { injectPageMeta } from './inject-page-meta';

function contextFor(pathname: string): Context {
	return {
		url: new URL(`http://localhost${pathname}`),
		request: new Request(`http://localhost${pathname}`),
		params: {},
		state: {},
	} as Context;
}

function htmlResponse(title = 'placeholder') {
	return new Response(
		`<!doctype html><html><head><title>${title}</title></head><body></body></html>`,
		{
			headers: { 'content-type': 'text/html; charset=utf-8' },
		},
	);
}

describe('injectPageMeta', () => {
	it('replaces the title block with route-specific SEO tags', async () => {
		const response = await injectPageMeta(contextFor('/projects'), async () =>
			htmlResponse('old title'),
		);
		const html = await response.text();

		expect(html).toContain('<title>Projects | Jereko</title>');
		expect(html).toContain('name="description"');
		expect(html).toContain('property="og:title"');
		expect(html).toContain('rel="canonical" href="https://jereko.dev/projects"');
		expect(html).not.toContain('old title');
	});

	it('passes through non-HTML responses unchanged', async () => {
		const json = new Response('{"ok":true}', {
			headers: { 'content-type': 'application/json' },
		});

		const response = await injectPageMeta(contextFor('/api'), async () => json);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(await response.text()).toBe('{"ok":true}');
	});

	it('injects 404 meta for unknown routes', async () => {
		const response = await injectPageMeta(contextFor('/unknown-route'), async () => htmlResponse());
		const html = await response.text();

		expect(html).toContain('<title>404 | Jereko</title>');
		expect(html).toContain('could not be found');
	});
});
