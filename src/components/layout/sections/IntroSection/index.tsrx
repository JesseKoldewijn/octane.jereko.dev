import { mostRecentExp } from '@/data/queries';
import { getAgeByDateString } from '@/utils/age';
import {
	AnimatedIntroSection1,
	AnimatedIntroSection2,
	AnimatedIntroSection3,
} from './_imports';

const year = 1999;
const month = 2;
const day = 15;

export function IntroSection() @{
	const myAge = getAgeByDateString(new Date(year, month, day).toDateString());
	const latestExperience = mostRecentExp();

	<div class="w-full text-balance text-neutral-600 dark:text-neutral-200">
		{'My name is '}
		<AnimatedIntroSection1 />
		{`, I'm a ${myAge} year old gamer, software engineer and tech enthusiast `}
		@if (latestExperience) {
			<span>
				{'currently working at '}
				<AnimatedIntroSection2 latestExperience={latestExperience} />
				{' as a '}
				<AnimatedIntroSection3 latestExperience={latestExperience} />
			</span>
		}
	</div>
}
