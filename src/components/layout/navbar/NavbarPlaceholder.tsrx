import { appConfig } from '@/config/app';
import { ThemeToggle } from '@/components/ui/ThemeToggle.tsrx';

/** Static navbar shell for SSR — mirrors layout without Radix (which breaks SSR). */
export function NavbarPlaceholder() @{
	<nav
		id="navbar"
		class="sticky top-0 z-50 flex w-full max-w-full px-6 py-4 transition-colors! duration-200! ease-in-out! bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(18,18,18,0.80)]"
	>
		<section class="my-auto mr-auto">
			<a
				href="/"
				class="flex font-semibold duration-500 hover:underline hover:underline-offset-4"
			>
				{'Jereko'}
			</a>
		</section>

		<section class="my-auto hidden flex-1 justify-center md:flex">
			<div class="flex items-center gap-6 text-sm font-medium">
				<a href="/about-me" class="hover:underline hover:underline-offset-4">
					{'About me'}
				</a>
				<a href="/projects" class="hover:underline hover:underline-offset-4">
					{'Pages'}
				</a>
				<a
					href={appConfig.repo.href}
					class="hover:underline hover:underline-offset-4"
					target="_blank"
					rel="noopener noreferrer"
				>
					{'OpenSource'}
				</a>
			</div>
		</section>

		<section class="my-auto mr-0 ml-auto flex gap-4">
			<button
				class="ring-offset-background bg-primary text-primary-foreground inline-flex h-10 items-center justify-center rounded-lg border p-2 px-4 py-2 text-sm font-medium md:hidden"
				aria-hidden="true"
				tabindex="-1"
				type="button"
			>
				<svg
					class="h-5 w-5"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<line x1="4" x2="20" y1="12" y2="12"></line>
					<line x1="4" x2="20" y1="6" y2="6"></line>
					<line x1="4" x2="20" y1="18" y2="18"></line>
				</svg>
			</button>
			<ThemeToggle />
		</section>
	</nav>
}
