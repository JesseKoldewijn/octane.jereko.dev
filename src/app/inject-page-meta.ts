import type { Middleware } from '@octanejs/vite-plugin';
import { getMetaForPath, SITE_URL } from '../config/meta.ts';

function escapeHtml(value: string) {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function buildMetaHtml(pathname: string) {
	const meta = getMetaForPath(pathname);
	const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}`;
	const ogImage = `${SITE_URL}/favicons/android-chrome-512x512.png`;

	return [
		`<title>${escapeHtml(meta.title)}</title>`,
		`<meta name="description" content="${escapeHtml(meta.description)}">`,
		`<link rel="canonical" href="${escapeHtml(canonical)}">`,
		`<meta property="og:type" content="website">`,
		`<meta property="og:url" content="${escapeHtml(canonical)}">`,
		`<meta property="og:title" content="${escapeHtml(meta.title)}">`,
		`<meta property="og:description" content="${escapeHtml(meta.description)}">`,
		`<meta property="og:image" content="${escapeHtml(ogImage)}">`,
		`<meta name="twitter:card" content="summary_large_image">`,
		`<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
		`<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
		`<meta name="twitter:image" content="${escapeHtml(ogImage)}">`,
	].join('\n    ');
}

/** Inject SEO tags into SSR HTML head — avoids hoisted head nodes inside #root (hydration crash). */
export const injectPageMeta: Middleware = async (context, next) => {
	const response = await next();
	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('text/html')) return response;

	const pathname = context.url.pathname.split('?')[0];
	const metaHtml = buildMetaHtml(pathname);
	let html = await response.text();
	html = html.replace(/<title>[\s\S]*?<\/title>/, metaHtml);

	return new Response(html, {
		status: response.status,
		headers: response.headers,
	});
};
