export function toggleTheme() {
	const root = document.documentElement;
	const isDark = root.classList.contains('dark');
	const newTheme = isDark ? 'light' : 'dark';

	const body = document.body;
	body.animate([{ opacity: 1 }, { opacity: 0 }], {
		duration: 250,
		easing: 'ease',
		fill: 'forwards',
	}).onfinish = () => {
		root.classList.remove('light', 'dark');
		root.classList.add(newTheme);
		localStorage.setItem('theme', newTheme);
		body.animate([{ opacity: 0 }, { opacity: 1 }], {
			duration: 250,
			easing: 'ease',
			fill: 'forwards',
		});
	};
}
