import { toggleTheme } from '@/lib/theme';
import { testIds } from '@/testids';

export function ThemeToggle() @{
	<button
		id="theme-toggle"
		type="button"
		data-testid={testIds.theme.toggle}
		class="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-background h-10 w-10 border p-2"
		aria-label="Toggle theme"
		onClick={(e) => {
			e.preventDefault();
			toggleTheme();
		}}
	>
		<svg
			class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="12" r="4"></circle>
			<path d="M12 2v2"></path>
			<path d="M12 20v2"></path>
			<path d="m4.93 4.93 1.41 1.41"></path>
			<path d="m17.66 17.66 1.41 1.41"></path>
			<path d="M2 12h2"></path>
			<path d="M20 12h2"></path>
			<path d="m6.34 17.66-1.41 1.41"></path>
			<path d="m19.07 4.93-1.41 1.41"></path>
		</svg>
		<svg
			class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
		</svg>
		<span class="sr-only">{'Toggle theme'}</span>
	</button>
}
