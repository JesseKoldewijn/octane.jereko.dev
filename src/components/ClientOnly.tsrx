import { useSyncExternalStore } from 'octane';

const subscribe = () => () => {};

export function useHydrated() {
	// Octane's server useSyncExternalStore only reads getServerSnapshot when
	// rest.length >= 2 (slot + snapshot). Without a slot arg it falls back to
	// getSnapshot () => true, which would SSR-render Radix nav and crash.
	if (typeof window === 'undefined') return false;
	return useSyncExternalStore(subscribe, () => true, () => false);
}

export function ClientOnly(props: { fallback?: unknown; children: unknown }) @{
	const hydrated = useHydrated();

	<>
		{hydrated ? props.children : (props.fallback ?? null)}
	</>
}
