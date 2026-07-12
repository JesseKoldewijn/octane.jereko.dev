/// <reference types="vite/client" />

declare const __APP_BUILD_ID__: string;

declare module '*.tsrx' {
	import type { ComponentType } from 'octane';

	type TsrxExport = ComponentType<Record<string, unknown>> | ((...args: unknown[]) => unknown);

	export default TsrxExport;

	// Named exports referenced from .ts entrypoints (Octane compiles .tsrx separately).
	export const Home: TsrxExport;
	export const Projects: TsrxExport;
	export const Experience: TsrxExport;
	export const AboutMe: TsrxExport;
	export const AboutMeHobbies: TsrxExport;
	export const AboutMeVolunteering: TsrxExport;
	export const Offline: TsrxExport;
	export const EmptyPage: TsrxExport;
	export const NotFound: TsrxExport;
	export const TextGen: TsrxExport;
	export const AnimatedIntroSection1: TsrxExport;
	export const AnimatedIntroSection2: TsrxExport;
	export const AnimatedIntroSection3: TsrxExport;
	export const NavLink: TsrxExport;
	export const ThemeToggle: TsrxExport;
	export const Navbar: TsrxExport;
	export const MobileNavDialog: TsrxExport;
	export const NavDropdown: TsrxExport;
	export const ToTopButton: TsrxExport;
	export const GoToHeading: TsrxExport;
}

declare module '*.webp' {
	const src: string;
	export default src;
}

declare module '*.png' {
	const src: string;
	export default src;
}

declare module '*.svg' {
	const src: string;
	export default src;
}

declare module 'virtual:pwa-register' {
	export interface RegisterSWOptions {
		immediate?: boolean;
		onNeedRefresh?: () => void;
		onOfflineReady?: () => void;
		onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
		onRegisteredSW?: (
			swScriptUrl: string,
			registration: ServiceWorkerRegistration | undefined,
		) => void;
		onRegisterError?: (error: unknown) => void;
	}
	export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}
