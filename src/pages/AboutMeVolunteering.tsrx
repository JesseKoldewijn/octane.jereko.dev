import { AboutMeHeader } from '@/components/page-elements/about-me/AboutMeHeader.tsrx';
import { AnimatedGradientText } from '@/components/animated/animated-grad-text.tsrx';
import { themedAvatar } from '@/config/images';

const volunteerStart = new Date(2021, 6, 1);

function volunteeringSince() {
  const dateArray = volunteerStart
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    .replace(',', '')
    .split(' ');
  return `${dateArray[0]} ${dateArray[1] === '1' ? '1st' : `${dateArray[1]}th`} ${dateArray[2]}`;
}

function volunteeringForMonths() {
  const today = new Date();
  const months = (today.getFullYear() - volunteerStart.getFullYear()) * 12;
  const difference = today.getMonth() - volunteerStart.getMonth() + months;
  if (difference > 12) {
    return `${Math.floor(difference / 12)} years and ${difference % 12} months`;
  }
  return String(difference);
}

export function AboutMeVolunteering() @{
	const since = volunteeringSince();
	const duration = volunteeringForMonths();

	<div>
		<AboutMeHeader
			pathname="/about-me/volunteering"
			bannerImage={themedAvatar}
			title="Volunteering"
			description="About my volunteering experience. So what do I do?"
		/>
		<div class="mx-4 flex flex-col items-center justify-center gap-8 lg:mx-2 lg:flex-row">
			<section class="flex w-auto max-w-md flex-col gap-4 text-center">
				<h2 class="text-center text-2xl font-bold">{'In what way do I volunteer?'}</h2>
				<div class="flex flex-col gap-4">
					<p>
						{'Since '}{since}{' I have been a volunteer for '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="Stack Up" noSplit />
						{' as a '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="GameLead" noSplit />
						{'. I am responsible for hosting and moderating the '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="Game Nights" noSplit />
						{" that I host which I've been hosting once a week (most of the time) for the past "}{duration}{'.'}
					</p>
					<p>
						{'What are Game Nights? '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="Game Nights" noSplit />
						{' are a way for Stack Up to bring people together from all over the world to play video games and socialize with one another. We host Game Nights for a wide variety of games, from '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="Call of Duty" noSplit />
						{' to '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="Dungeons & Dragons" noSplit />
						{'.'}
					</p>
					<p>
						{'The main purpose of Game Nights is to bring people together to have fun, make new friends, and to help combat isolation and loneliness by providing a '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="safe and welcoming" noSplit />
						{' environment everybody is welcome.'}
					</p>
				</div>
			</section>
			<section class="xs:mb-auto flex w-auto max-w-md flex-col gap-4 text-center">
				<h2 class="text-center text-2xl font-bold">{'About Stack Up'}</h2>
				<div class="flex flex-col gap-4">
					<p>
						<AnimatedGradientText class="font-semibold" variant="span" text="Stack Up" noSplit />
						{', a 501(c)(3) non-profit that supports Active, Veteran service members and civilians from the U.S. and allied nations by promoting positive mental health and combat (mainly veteran) suicide through '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="gaming and geek culture" noSplit />
						{'.'}
					</p>
					<p>
						{'The main focus of Stack Up is directed towards '}
						<AnimatedGradientText class="mx-1 font-semibold" variant="span" text="Veterans" noSplit />
						{' and Active service members, but just about anybody is welcome to join the community as long as their over 18 years old.'}
					</p>
				</div>
			</section>
		</div>
	</div>
}
