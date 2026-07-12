import { useEffect, useState } from 'octane';
import { useHydrated } from '@/components/ClientOnly.tsrx';
import { TextGenFallback } from '@/components/animated/text-gen-fallback.tsrx';
import { prefersReducedMotion, scheduleIdleTask } from '@/lib/schedule-idle';

interface TextGenProps {
	words: string;
	className?: string;
}

function toDisplayText(words: string | string[]): string {
	return Array.isArray(words) ? words.join(' ') : words;
}

function TextGenAnimated(props: TextGenProps) @{
	const { words, className } = props;
	const displayText = toDisplayText(words);
	const [Animated, setAnimated] = useState<((props: TextGenProps) => any) | null>(null);

	useEffect(() => {
		if (prefersReducedMotion()) return;

		scheduleIdleTask(() => {
			void import('./text-gen.tsrx').then((mod) => {
				if (mod?.INTERNAL_TextGenComponent) {
					setAnimated(() => mod.INTERNAL_TextGenComponent as unknown as typeof Animated);
				}
			});
		});
	}, []);

	@if (Animated) {
		<Animated words={displayText} className={className} />
	} @else {
		<TextGenFallback words={displayText} className={className} />
	}
}

export function TextGen(props: TextGenProps) @{
	const { words, className } = props;
	const displayText = toDisplayText(words);
	const hydrated = useHydrated();

	@if (!hydrated) {
		<TextGenFallback words={displayText} className={className} />
	} @else {
		<TextGenAnimated words={displayText} className={className} />
	}
}
