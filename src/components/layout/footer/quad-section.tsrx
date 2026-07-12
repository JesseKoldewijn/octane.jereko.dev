import { NavLink } from '@/components/NavLink.tsrx';
import { appConfig } from '@/config/app';
import { mostRecentExp } from '@/data/queries';
import { cn } from '@/lib/utils';
import { getAgeByDateString } from '@/utils/age';

function PageListItem(props: { href: string; name: string }) @{
	const { href, name } = props;
	const isExternalLink = !href.startsWith('/');

	@if (isExternalLink) {
		<a
			href={href}
			class={cn(
				'flex h-[48px] rounded-md border border-neutral-500 p-2',
				'sm:list-item sm:h-auto sm:border-0 sm:p-0 sm:hover:underline',
			)}
			target="_blank"
			rel="noopener noreferrer"
		>
			<span class="mx-auto my-auto sm:mx-0 sm:my-0">{name}</span>
		</a>
	} @else {
		<NavLink
			to={href}
			class={cn(
				'flex h-[48px] rounded-md border border-neutral-500 p-2',
				'sm:list-item sm:h-auto sm:border-0 sm:p-0 sm:hover:underline',
			)}
		>
			<span class="mx-auto my-auto sm:mx-0 sm:my-0">{name}</span>
		</NavLink>
	}
}

export function QuadSection() @{
	const latestExp = mostRecentExp();
	const isLatestExpCurrent = latestExp?.end_month == 'current';

	const pagesLinks = [
		{ href: '/about-me', name: 'About Me' },
		{ href: '/experience', name: 'Experience' },
		{ href: '/projects', name: 'Projects' },
		{ href: appConfig.repo.href, name: 'OpenSource' },
	];

	const avatarSrc = '/images/profile.webp';

	<div class="container grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
		<div class="flex flex-col-reverse justify-start gap-4 sm:justify-end lg:flex-col lg:items-center lg:justify-start lg:gap-8">
			<div class="flex w-full flex-col justify-center">
				<span class="[background-size:30%] text-lg font-bold">{'Jereko'}</span>
				<p class="mt-2 text-sm text-neutral-600 dark:text-neutral-200">
					{"My personal website. Wan't to know more about my projects, work experience, hobbies and more? Feel free to take a look around!"}
				</p>
			</div>
			<div class="relative mx-auto mb-4 block h-24 w-24 rounded-full object-cover lg:mx-0 lg:mb-0">
				<div class="absolute inset-0 -z-50 rotate-90 rounded-full bg-[rgba(0,0,0,0.5)] opacity-0 transition-all hover:rotate-0 hover:opacity-100 md:z-10">
					<div class="inset-0 flex h-full w-full items-center justify-center select-none">
						{'Peekaboo!'}
					</div>
				</div>
				<img
					alt="Profile picture of Jesse Koldewijn"
					src={avatarSrc}
					width={96}
					height={96}
					sizes="96px"
					loading="lazy"
					class="absolute aspect-square rounded-full"
				/>
			</div>
		</div>
		<div class="flex flex-col justify-start sm:justify-end lg:justify-start">
			<span class="text-lg font-bold">{'Pages'}</span>
			<div
				class="mt-4 flex flex-col gap-4 text-base text-neutral-600 sm:mt-2 sm:list-inside sm:gap-2 dark:text-neutral-200"
				data-device="desktop"
			>
				@for (const page of pagesLinks; key page.href) {
					<PageListItem href={page.href} name={page.name} />
				}
			</div>
		</div>
		<div>
			<span class="mb-4 text-lg font-bold">{"What's My Name?!"}</span>
			<p class="mt-2 text-sm text-neutral-600 dark:text-neutral-200">
				{"Hey there! My name is Jesse Koldewijn, I'm a "}
				{getAgeByDateString('1999-02-15')}
				{' year old '}
				{latestExp ? latestExp.title : 'Tech Enthusiast'}
				{' from The Netherlands.'}
			</p>
		</div>
		@if (latestExp) {
			<div>
				<span class="mb-4 text-lg font-bold">
					{isLatestExpCurrent ? 'Current Job' : 'Most Recent Job'}
				</span>
				<p class="mt-2 text-sm text-neutral-600 dark:text-neutral-200">
					{`${isLatestExpCurrent ? 'Currently working at' : 'Worked at'} ${latestExp.company_name} in ${latestExp.location} as ${latestExp.title}`}
				</p>
			</div>
		}
	</div>
}
