import { allProjects } from '@/data/queries';
import { ProjectListerItem } from './ProjectListerItem.tsrx';

export function ProjectsLister() @{
	const _projects = allProjects();

	<div class="flex flex-col gap-4">
		@if (_projects && _projects.length > 0) {
			@for (const project of _projects; key project.title) {
				<div>
					<ProjectListerItem project={project} />
				</div>
			}
		} @else {
			<p>{'No projects found'}</p>
		}
	</div>
}
