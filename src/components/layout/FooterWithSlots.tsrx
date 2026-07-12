import { usedTechnologies } from '@/config/tech';
import { Footer } from './footer/index.tsrx';
import { QuadSection } from './footer/quad-section.tsrx';
import { TechUsed } from './footer/tech-used.tsrx';

export function FooterWithSlots(props) @{
	const { socials } = props;

	<Footer
		topSlot={<TechUsed techUsed={usedTechnologies} />}
		innerSlot={<QuadSection />}
		socials={socials}
	/>
}
