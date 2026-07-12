import { NavLink } from '@/components/NavLink.tsrx';
import { Button } from '@/components/ui/button';

export function HeroSectionButtons(props) @{
	const { bannerContent } = props;

	@if (bannerContent.ctas && bannerContent.ctas.length == 2) {
		<div class="mt-4 flex flex-wrap gap-4">
			<Button class="mr-4 inline-flex items-center justify-center rounded-lg border px-5 py-3 text-center text-base font-medium hover:bg-neutral-900 hover:text-neutral-100 focus:ring-4 dark:hover:bg-neutral-100 dark:hover:text-neutral-900">
				@if (bannerContent.ctas[0].url.startsWith('http')) {
					<a
						href={bannerContent.ctas[0].url}
						class="inline-flex items-center justify-center"
						target="_blank"
						rel="noopener noreferrer"
					>
						{bannerContent.ctas[0].title}
						<svg
							class="-mr-1 ml-2 h-5 w-5"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill-rule="evenodd"
								d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
								clip-rule="evenodd"
							></path>
						</svg>
					</a>
				} @else {
					<NavLink
						to={bannerContent.ctas[0].url}
						class="inline-flex items-center justify-center"
					>
						{bannerContent.ctas[0].title}
						<svg
							class="-mr-1 ml-2 h-5 w-5"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill-rule="evenodd"
								d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
								clip-rule="evenodd"
							></path>
						</svg>
					</NavLink>
				}
			</Button>
			<Button class="inline-flex items-center justify-center rounded-lg border px-5 py-3 text-center text-base font-medium hover:bg-neutral-900 hover:text-neutral-100 focus:ring-4 dark:hover:bg-neutral-100 dark:hover:text-neutral-900">
				@if (bannerContent.ctas[1].url.startsWith('http')) {
					<a
						href={bannerContent.ctas[1].url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{bannerContent.ctas[1].title}
					</a>
				} @else {
					<NavLink to={bannerContent.ctas[1].url}>
						{bannerContent.ctas[1].title}
					</NavLink>
				}
			</Button>
		</div>
	}
}
