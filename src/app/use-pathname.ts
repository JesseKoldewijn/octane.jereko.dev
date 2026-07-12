import { useEffect, useState } from 'octane';

/** Pathname for SSR + post-hydration client updates (popstate / same-document nav). */
export function usePathname(initialPathname: string) {
	const [pathname, setPathname] = useState(initialPathname);

	useEffect(() => {
		setPathname(window.location.pathname);

		const onPopState = () => setPathname(window.location.pathname);
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, []);

	return pathname;
}
