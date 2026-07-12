import { X } from '@/icons/custom/Twitter-X';
import { LuGithub } from '@/icons/lu/Github';
import { LuLinkedin } from '@/icons/lu/LinkedIn';
import { appConfig } from '@/config/app';
import { ToTopButton } from './to-top-button.tsrx';

export function Footer(props) @{
	const { topSlot, innerSlot, socials } = props;

	const getYear = () => {
		const initialYear = 2023;
		return initialYear === new Date().getFullYear()
			? initialYear
			: `${initialYear} - ${new Date().getFullYear()}`;
	};

	const getByPlatform = (platform: string) => {
		if (!socials) return null;
		return socials.find((social) => social.platform === platform);
	};

	const twitter = getByPlatform('twitter');
	const linkedin = getByPlatform('linkedin');
	const github = getByPlatform('github');

	<div class="mt-20">
		{topSlot}
		<footer class="mx-4 flex w-auto flex-col gap-10 rounded-t-2xl border-x border-t border-neutral-300 bg-neutral-100 px-4 py-10 md:px-6 lg:mx-8 lg:gap-20 lg:py-16 dark:border-neutral-700 dark:bg-neutral-900">
			{innerSlot}
			<div class="mx-5 flex flex-col items-center justify-center px-8 text-sm">
				<div class="mt-4 mb-4 flex gap-4">
					@if (twitter) {
						<a
							aria-label="X (formerly known as Twitter)"
							class="flex rounded-lg p-1 text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
							href={twitter.link ?? '#'}
							target="_blank"
							rel="noopener noreferrer"
							data-link-label={twitter.label ?? 'twitter-link-footer'}
						>
							<X className="m-auto h-5 w-auto" />
							<span class="sr-only">
								{'Link to X (formerly known as Twitter) profile'}
							</span>
						</a>
					}
					@if (github) {
						<a
							aria-label="GitHub"
							class="rounded-lg p-1 text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-400"
							href={github.link ?? '#'}
							target="_blank"
							rel="noopener noreferrer"
							data-link-label={github.label ?? 'github-link-footer'}
						>
							<LuGithub className="h-6 w-auto" />
							<span class="sr-only">{'Link to Github profile'}</span>
						</a>
					}
					@if (linkedin) {
						<a
							aria-label="LinkedIn"
							class="rounded-lg p-1 text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-400"
							href={linkedin.link ?? '#'}
							target="_blank"
							rel="noopener noreferrer"
							data-link-label={linkedin.label ?? 'linkedin-link-footer'}
						>
							<LuLinkedin className="h-6 w-auto" />
							<span class="sr-only">{'Link to LinkedIn profile'}</span>
						</a>
					}
				</div>
				<div class="mt-3 mb-4 flex gap-2">
					<span class="border-r-2 pr-2 text-neutral-800 dark:text-neutral-300">
						{getYear()}
					</span>
					<span class="font-semibold">{appConfig.branding.brandName}</span>
				</div>
				<ToTopButton />
			</div>
		</footer>
	</div>
}
