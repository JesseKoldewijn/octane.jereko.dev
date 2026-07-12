/** Run a non-critical task after first paint when the browser is idle. */
export function scheduleIdleTask(task: () => void): void {
	if (typeof window === 'undefined') return;

	if ('requestIdleCallback' in window) {
		window.requestIdleCallback(() => task(), { timeout: 2_000 });
		return;
	}

	setTimeout(task, 1);
}

export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}
