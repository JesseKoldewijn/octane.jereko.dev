import { LuMouse } from '@/icons/lu/Mouse';
import { Card } from '@/components/ui/card.tsrx';
import type { Project } from '@/data/projects';

function ProjectCardBody(props: { project: Project }) @{
	const { project } = props;
	const tags = (project.tags ?? '').split(',').filter(Boolean);
	const tagItems = tags.map((tag: string, index: number) => ({
		key: `${project.title}-${tag}-${index}`,
		label: tag.trim(),
	}));

	<Card class="w-full max-w-md bg-neutral-100 p-5 dark:bg-neutral-900">
		<div class="flex flex-col space-y-1.5">
			<h3 class="text-2xl leading-none font-semibold tracking-tight flex items-center justify-between">
				<span class="block w-full max-w-[270px] overflow-hidden text-ellipsis whitespace-nowrap md:max-w-[300px]">
					{project.title}
				</span>
				@if (project.link) {
					<LuMouse
						height={24}
						width={24}
						className="text-muted-foreground animate-pulse"
					/>
				}
			</h3>
			<p class="text-muted-foreground text-sm">{project.sub_title}</p>
		</div>
		<div class="px-2 pt-4">{project.description}</div>
		<div class="flex flex-wrap items-start gap-2 gap-y-4 px-0 pt-4">
			@for (const entry of tagItems; key entry.key) {
				<div
					class="rounded-full border bg-gray-300 px-2 py-1 text-neutral-950 dark:border-neutral-300 dark:bg-neutral-700 dark:text-neutral-300"
				>
					{entry.label}
				</div>
			}
		</div>
	</Card>
}

export function ProjectListerItem(props: { project: Project }) @{
	const { project } = props;

	@if (String(project.draft) === 'true') {
		<div class="hidden" aria-hidden="true"></div>
	} @else if (project.link) {
		<a
			href={project.link}
			target="_blank"
			rel="noopener noreferrer"
			class="flex rounded-lg border border-neutral-300 transition-colors duration-500 hover:border-neutral-500 dark:border-neutral-800 hover:dark:border-neutral-200"
		>
			<ProjectCardBody project={project} />
		</a>
	} @else {
		<ProjectCardBody project={project} />
	}
}
