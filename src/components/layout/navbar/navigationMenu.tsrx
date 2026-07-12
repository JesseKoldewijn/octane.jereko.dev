import { LuGithub } from '@/icons/lu/Github';
import { LuList } from '@/icons/lu/List';
import { LuUser } from '@/icons/lu/User';
import { appConfig } from '@/config/app';
import { listedLinks, showcaseLinks } from '@/data/navigation';
import { testIds } from '@/testids';
import { ShowcaseNavSection } from './item-variants/showcase.tsrx';
import { ListedNavSection } from './item-variants/listed.tsrx';
import { SingleItemSection } from './item-variants/singleItem.tsrx';

export const showcaseEntry = {
	triggerTitle: (
		<span class="inline-flex items-center">
			<LuUser className="mr-2 h-5 w-auto" />
			{'About me'}
		</span>
	),
	...showcaseLinks,
};

export const listedEntry = {
	triggerTitle: (
		<span class="inline-flex items-center">
			<LuList className="mr-2 h-5 w-auto" />
			{'Pages'}
		</span>
	),
	...listedLinks,
};

export function NavbarMenu() @{
	<nav aria-label="Main" data-testid={testIds.nav.mainMenu} class="relative z-50 hidden md:block">
		<ul class="flex list-none items-center justify-center space-x-1">
			<ShowcaseNavSection {...showcaseEntry} />
			<ListedNavSection {...listedEntry} />
			<SingleItemSection href={appConfig.repo.href} data-testid={testIds.nav.openSourceLink} class="flex">
				<LuGithub className="mr-2 h-5 w-auto" />
				<span>{'OpenSource'}</span>
			</SingleItemSection>
		</ul>
	</nav>
}
