/** Stable selectors for tests — always use `data-testid`, never vague DOM queries. */
export const testIds = {
	nav: {
		root: 'navbar',
		logo: 'navbar-logo-link',
		mainMenu: 'navbar-main-menu',
		mobileMenuToggle: 'navbar-mobile-menu-toggle',
		mobileDialog: 'navbar-mobile-dialog',
		mobileDialogBackdrop: 'navbar-mobile-dialog-backdrop',
		mobileDialogContent: 'navbar-mobile-dialog-content',
		openSourceLink: 'navbar-open-source-link',
		dropdown: {
			aboutMe: {
				trigger: 'navbar-dropdown-about-me-trigger',
				panel: 'navbar-dropdown-about-me-panel',
				showcaseLink: 'navbar-dropdown-about-me-showcase-link',
				link: (slug: string) => `navbar-dropdown-about-me-link-${slug}`,
			},
			pages: {
				trigger: 'navbar-dropdown-pages-trigger',
				panel: 'navbar-dropdown-pages-panel',
				link: (slug: string) => `navbar-dropdown-pages-link-${slug}`,
			},
		},
		mobileLink: (slug: string) => `navbar-mobile-link-${slug}`,
	},
	theme: {
		toggle: 'theme-toggle',
	},
	footer: {
		toTopButton: 'footer-to-top-button',
	},
	aboutMe: {
		goToHeadingButton: 'about-me-go-to-heading-button',
		navigation: 'about-me-navigation',
	},
} as const;

/** Turn `/about-me/hobbies` into `about-me-hobbies`, `/` into `home`. */
export function hrefToTestIdSlug(href: string): string {
	const normalized = href.replace(/^\//, '').replace(/\/$/, '');
	return normalized.replace(/\//g, '-') || 'home';
}
