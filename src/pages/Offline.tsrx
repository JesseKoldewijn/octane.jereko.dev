import { NavLink } from '@/components/NavLink.tsrx';

export function Offline() @{
	<div class="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
		<h1 class="text-2xl font-bold md:text-3xl">{"You're offline"}</h1>
		<p class="text-muted-foreground max-w-md">
			{"Check your connection and try again. When you're back online, refresh the page."}
		</p>
		<button
			type="button"
			class="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
			onClick={() => window.location.reload()}
		>
			{'Retry'}
		</button>
		<NavLink
			to="/"
			class="text-muted-foreground underline underline-offset-4 hover:text-foreground"
		>
			{'Back to home'}
		</NavLink>
	</div>
}
