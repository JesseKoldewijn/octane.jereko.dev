import { base } from '@/utils/hostname';
import { hrefToTestIdSlug, testIds } from '@/testids';
import type { NavLink, NavShowcaseEntry } from '@/data/navigation';
import { ListItem } from '../_parts/listItem.tsrx';
import { NavDropdown } from '../_parts/NavDropdown.tsrx';

export function ShowcaseNavSection(props: {
	triggerTitle: string;
	showcase: NavShowcaseEntry['showcase'];
	links?: readonly NavLink[];
}) @{
	const { triggerTitle, showcase, links } = props;

	<NavDropdown
		trigger={triggerTitle}
		triggerTestId={testIds.nav.dropdown.aboutMe.trigger}
		panelTestId={testIds.nav.dropdown.aboutMe.panel}
		panelClassName="overflow-hidden"
	>
		<ul class="grid gap-3 bg-neutral-100 p-6 md:w-100 lg:w-125 lg:grid-cols-[.75fr_1fr] dark:bg-neutral-900">
			<li class="row-span-3 list-none rounded-lg bg-black text-white dark:bg-neutral-100 dark:text-neutral-900">
				<a
					data-testid={testIds.nav.dropdown.aboutMe.showcaseLink}
					class="flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b from-neutral-100 to-neutral-900 p-6 no-underline outline-none select-none focus:shadow-md"
					href={showcase.href}
					target={
						!showcase.href.startsWith('/')
							? !showcase.href.includes(base)
								? '_blank'
								: undefined
							: undefined
					}
				>
					<div class="inset-0 mt-auto flex max-h-max w-full flex-1 flex-col gap-2 text-neutral-200 no-underline outline-none select-none dark:text-neutral-100">
						<div class="text-base font-semibold">{showcase.title}</div>
						<p class="text-sm leading-tight opacity-90">{showcase.description}</p>
					</div>
				</a>
			</li>
			@if (links && links.length > 0) {
				@for (const link of links; key link.href) {
					<ListItem
						href={link.href}
						title={link.title}
						data-testid={testIds.nav.dropdown.aboutMe.link(hrefToTestIdSlug(link.href))}
						target={
							!link.href.startsWith('/')
								? !link.href.includes(base)
									? '_blank'
									: undefined
								: undefined
						}
					>
						{link.description}
					</ListItem>
				}
			}
		</ul>
	</NavDropdown>
}
