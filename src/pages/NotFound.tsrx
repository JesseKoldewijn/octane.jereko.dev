import { NavLink } from '@/components/NavLink.tsrx';

export function NotFound() @{
	<section class="mx-auto flex flex-col items-center justify-center gap-8 px-4 py-20 text-center">
		<h1 class="text-4xl font-bold">{'404'}</h1>
		<p class="text-neutral-600 dark:text-neutral-200">{'Page not found.'}</p>
		<NavLink to="/" class="text-primary underline hover:no-underline">
			{'Go home'}
		</NavLink>
	</section>
}
