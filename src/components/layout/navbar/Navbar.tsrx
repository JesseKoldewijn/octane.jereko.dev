import { NavLink } from '@/components/NavLink.tsrx';
import { ThemeToggle } from '@/components/ui/ThemeToggle.tsrx';
import { testIds } from '@/testids';
import { NavbarMenu } from './navigationMenu.tsrx';

function toggleMobileNav() {
	const dialog = document.querySelector<HTMLDialogElement>('#mobile-nav-dialog');
	if (!dialog) return;
	if (dialog.open) dialog.close();
	else dialog.showModal();
}

export function Navbar() @{
	<nav
		id="navbar"
		data-testid={testIds.nav.root}
		class="sticky top-0 z-50 flex w-full max-w-full overflow-visible px-6 py-4 transition-colors! duration-200! ease-in-out! bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(18,18,18,0.80)]"
	>
		<section class="my-auto mr-auto">
			<NavLink
				to="/"
				id="Jereko logo"
				testId={testIds.nav.logo}
				label="Jereko"
				class="flex font-semibold duration-500 hover:underline hover:underline-offset-4"
			/>
		</section>

		<section class="my-auto flex flex-1 justify-center">
			<NavbarMenu />
		</section>

		<section class="my-auto mr-0 ml-auto flex gap-4">
			<button
				type="button"
				data-testid={testIds.nav.mobileMenuToggle}
				class="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-lg border p-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:hidden"
				aria-label="Toggle mobile navigation menu"
				aria-controls="mobile-nav-dialog"
				onClick={toggleMobileNav}
			>
				<svg
					class="mobile-nav-icon-menu h-5 w-5"
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
				<svg
					class="mobile-nav-icon-close h-5 w-5"
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
					<path d="M18 6 6 18"></path>
					<path d="m6 6 12 12"></path>
				</svg>
				<span class="sr-only">{'Toggle mobile navigation menu'}</span>
			</button>

			<ThemeToggle />
		</section>
	</nav>
}
