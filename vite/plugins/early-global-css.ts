import type { Plugin } from 'vite';

const GLOBAL_CSS = '/src/styles/globals.css';

/** Load Tailwind globals from `<head>`, not behind the hydrate JS module graph. */
export function earlyGlobalCss(): Plugin[] {
	return [
		{
			name: 'early-global-css:inject',
			transformIndexHtml: {
				order: 'pre',
				handler(html, ctx) {
					const href = ctx.server ? `${GLOBAL_CSS}?direct` : GLOBAL_CSS;
					const cleaned = html.replace(/<link\b[^>]*\bglobals\.css[^>]*>\n?/gi, '');
					return cleaned.replace(
						/(<meta name="viewport"[^>]*>)/,
						`$1\n\t\t<link rel="stylesheet" href="${href}" />`,
					);
				},
			},
		},
		{
			name: 'early-global-css:reorder',
			apply: 'build',
			transformIndexHtml: {
				order: 'post',
				handler(html) {
					const match = html.match(
						/<link rel="stylesheet" crossorigin href="(\/assets\/style-[^"]+\.css)">/,
					);
					if (!match) return html;

					const href = match[1]!;
					let out = html.replace(
						/<link rel="stylesheet" crossorigin href="\/assets\/style-[^"]+\.css">\n?/g,
						'',
					);
					if (!out.includes(`href="${href}"`)) {
						out = out.replace(
							/(<meta name="viewport"[^>]*>)/,
							`$1\n\t\t<link rel="stylesheet" crossorigin href="${href}">`,
						);
					}
					return out;
				},
			},
		},
	];
}
