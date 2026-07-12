import { listedLinks } from '@/data/navigation';
import { base } from '@/utils/hostname';
import { hrefToTestIdSlug, testIds } from '@/testids';
import type { NavLink } from '@/data/navigation';
import { ListItem } from '../_parts/listItem.tsrx';
import { NavDropdown } from '../_parts/NavDropdown.tsrx';

export function ListedNavSection(props: {
	triggerTitle: string;
	links?: readonly NavLink[];
}) @{
	const { triggerTitle, links = listedLinks.links } = props;

	<NavDropdown
		trigger={triggerTitle}
		triggerTestId={testIds.nav.dropdown.pages.trigger}
		panelTestId={testIds.nav.dropdown.pages.panel}
	>
		<ul class="grid w-[400px] gap-3 bg-neutral-100 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] dark:bg-neutral-900">
			@if (links.length > 0) {
				@for (const link of links; key link.href) {
					<ListItem
						title={link.title}
						data-testid={testIds.nav.dropdown.pages.link(hrefToTestIdSlug(link.href))}
						href={link.href}
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
