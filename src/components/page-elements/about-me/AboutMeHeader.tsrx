import { NavLink } from '@/components/NavLink.tsrx';
import { HeroSection } from '@/components/layout/sections/HeroSection.tsrx';
import { cn } from '@/lib/utils';
import { testIds } from '@/testids';

const navItems = [
	{ href: '/about-me', label: 'About Me' },
	{ href: '/about-me/hobbies', label: 'Hobbies' },
	{ href: '/about-me/volunteering', label: 'Volunteering' },
] as const;

export function AboutMeHeader(props) @{
	const { pathname, bannerImage, title, description } = props;

	<div>
		<HeroSection
			bannerImage={bannerImage}
			bannerContent={{ title, description }}
		/>
		<div
			id={testIds.aboutMe.navigation}
			data-testid={testIds.aboutMe.navigation}
			class="xs:flex-row xs:gap-8 xs:px-0 flex flex-col items-center justify-center gap-4 px-4 pb-8"
		>
			@for (const item of navItems; key item.href) {
				<NavLink
					to={item.href}
					label={item.label}
					class={cn(
						pathname === item.href
							? 'bg-neutral-100 text-neutral-900 sm:dark:hover:border-neutral-200 sm:dark:hover:bg-transparent sm:dark:hover:text-neutral-200'
							: 'sm:hover:bg-neutral-100 sm:hover:text-neutral-900',
						'xs:w-auto w-full rounded-lg border border-neutral-200 px-3 py-2 text-center sm:hover:bg-neutral-100 sm:hover:text-neutral-900',
					)}
				/>
			}
		</div>
	</div>
}
