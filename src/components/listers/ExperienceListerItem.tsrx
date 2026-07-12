import { isMultiRoleExperience } from '@/data/experiences';
import type { Experience, ExperienceRole } from '@/data/experiences';

const experienceCardClass =
	'bg-card text-card-foreground w-full max-w-md rounded-lg border bg-neutral-100 p-5 shadow-xs dark:bg-neutral-900';

function formatDateRange(role: ExperienceRole | Experience) {
	const startDate =
		String(role.start_month) !== 'upcoming' &&
		String(role.start_year) !== 'upcoming'
			? new Date(
					role.start_year + '/' + role.start_month + ' ' + '01',
				).toLocaleString('default', {
					month: 'long',
					year: 'numeric',
				})
			: 'Upcoming';
	const endDate =
		String(role.end_month) !== 'current' && String(role.end_year) !== 'current'
			? new Date(role.end_year + '/' + role.end_month + '/01').toLocaleString(
					'default',
					{
						month: 'long',
						year: 'numeric',
					},
				)
			: 'Current';
	return `${startDate} - ${endDate}`;
}

function RoleBlock(props: { role: ExperienceRole; expKey: string }) @{
	const { role, expKey } = props;
	const skills = role.skills?.split(',') ?? [];
	const skillTags = skills.map((skill: string) => ({
		key: `${skill}-${expKey}`,
		skill,
	}));

	<div class="border-l-2 border-neutral-300 pl-4 dark:border-neutral-600">
		<p class="font-medium">{role.title}</p>
		<p class="text-muted-foreground text-sm">{formatDateRange(role)}</p>
		<p class="mt-2">{role.description}</p>
		<div class="mt-3 flex flex-wrap gap-2">
			@for (const entry of skillTags; key entry.key) {
				<span
					class="rounded-full border bg-gray-300 px-2 py-1 text-neutral-950 dark:border-neutral-300 dark:bg-neutral-700 dark:text-neutral-300"
				>
					{entry.skill}
				</span>
			}
		</div>
	</div>
}

export function ExperienceListerItem(props: { experience: Experience }) @{
	const { experience } = props;
	const skills = experience.skills?.split(',') ?? [];
	const skillTags = skills.map((skill: string) => ({
		key: `${skill}-${experience.exp_key}`,
		skill,
	}));

	@if (isMultiRoleExperience(experience)) {
		<div class={experienceCardClass}>
			<h3 class="text-2xl leading-none font-semibold tracking-tight" suppressHydrationWarning>
				{experience.company_name}
			</h3>
			<p class="text-muted-foreground text-sm" suppressHydrationWarning>{experience.location}</p>
			<div class="space-y-6 px-2 pt-4">
				@for (const role of experience.roles; key role.title) {
					<RoleBlock role={role} expKey={experience.exp_key} />
				}
			</div>
		</div>
	} @else {
		<div class={experienceCardClass}>
			<h3 class="text-2xl leading-none font-semibold tracking-tight" suppressHydrationWarning>
				{experience.title}
			</h3>
			<p class="text-muted-foreground text-sm" suppressHydrationWarning>
				{`${experience.company_name} | ${experience.location}`}
			</p>
			<div class="px-2 pt-4">
				<p>{experience.description}</p>
				<p class="mt-4">{formatDateRange(experience)}</p>
			</div>
			<div class="flex flex-wrap items-start gap-2 gap-y-4 px-0 py-0">
				@for (const entry of skillTags; key entry.key) {
					<div
						class="rounded-full border bg-gray-300 px-2 py-1 text-neutral-950 dark:border-neutral-300 dark:bg-neutral-700 dark:text-neutral-300"
					>
						{entry.skill}
					</div>
				}
			</div>
		</div>
	}
}
