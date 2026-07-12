import { allExperiences, getExperienceStartDate } from '@/data/queries';
import { ExperienceListerItem } from './ExperienceListerItem.tsrx';
import type { Experience } from '@/data/experiences';

export function ExperienceLister(props: { experienceOverride?: readonly Experience[] }) @{
	const { experienceOverride } = props;
	const experience = experienceOverride ?? allExperiences();

	const sorted = [...experience].sort((a, b) => {
		const aDate = new Date(getExperienceStartDate(a)).getTime();
		const bDate = new Date(getExperienceStartDate(b)).getTime();
		return bDate - aDate;
	});

	<div class="flex flex-col gap-4">
		@if (sorted.length > 0) {
			@for (const exp of sorted; key exp.exp_key) {
				<div>
					<ExperienceListerItem experience={exp} />
				</div>
			}
		} @else {
			<p>{'No experiences found'}</p>
		}
	</div>
}
