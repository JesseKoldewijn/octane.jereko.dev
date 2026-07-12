import { useEffect, useRef } from 'octane';
import { NavLink } from '@/components/NavLink.tsrx';
import { appConfig } from '@/config/app';
import {
	getAboutMeIconKey,
	getInternalIconKey,
	listedLinks,
	showcaseLinks,
} from '@/data/navigation';
import type { Socials } from '@/data/socials';
import { hrefToTestIdSlug, testIds } from '@/testids';
import { setupMobileDialog } from '../mobile-nav';

const linkClass =
	'border-foreground flex w-full items-center justify-center gap-2 rounded-lg border p-2';

function MobileNavLink(props: {
	href: string;
	label: string;
	external?: boolean;
	testId: string;
}) @{
	const { href, label, external, testId } = props;

	@if (external) {
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			class={linkClass}
			data-testid={testId}
		>
			{label}
		</a>
	} @else {
		<NavLink to={href} class={linkClass} testId={testId}>
			{label}
		</NavLink>
	}
}

export function MobileNavDialog(props: { socials: Socials | null }) @{
	const { socials } = props;
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (dialogRef.current) setupMobileDialog(dialogRef.current);
	}, []);

	<div>
		<div
			id="mobile-nav-backdrop"
			data-testid={testIds.nav.mobileDialogBackdrop}
			aria-hidden="true"
		></div>

		<dialog id="mobile-nav-dialog" ref={dialogRef} data-testid={testIds.nav.mobileDialog}>
			<div
				id="mobile-nav-content"
				data-testid={testIds.nav.mobileDialogContent}
				class="text-foreground flex max-h-[calc(100dvh-4.5rem)] w-full flex-col items-center gap-4 overflow-y-auto px-4 pt-4 pb-8"
			>
				<strong>{'General Pages'}</strong>

				@for (const entry of listedLinks.links; key entry.href) {
					<MobileNavLink
						href={entry.href}
						label={entry.title}
						testId={testIds.nav.mobileLink(hrefToTestIdSlug(entry.href))}
					/>
				}

				<MobileNavLink
					href={appConfig.repo.href}
					label="OpenSource"
					external={true}
					testId={testIds.nav.mobileLink('open-source')}
				/>

				<strong>{'About Me'}</strong>

				@for (const entry of showcaseLinks.links; key entry.href) {
					<MobileNavLink
						href={entry.href}
						label={entry.title}
						testId={testIds.nav.mobileLink(hrefToTestIdSlug(entry.href))}
					/>
				}

				@if (socials) {
					<div class="contents">
						<strong>{'Socials'}</strong>
						@for (const social of socials; key social.platform) {
							<a
								href={social.link ?? '#'}
								target="_blank"
								rel="noopener noreferrer"
								class={linkClass}
								data-testid={testIds.nav.mobileLink(`social-${social.platform}`)}
							>
								{social.label}
							</a>
						}
					</div>
				}
			</div>
		</dialog>
	</div>
}
