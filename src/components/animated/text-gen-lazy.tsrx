import { useHydrated } from '@/components/ClientOnly.tsrx';
import { TextGenFallback } from '@/components/animated/text-gen-fallback.tsrx';
import { INTERNAL_TextGenComponent } from '@/components/animated/text-gen.tsrx';

interface TextGenProps {
	words: string;
	className?: string;
}

export function TextGen(props: TextGenProps) @{
	const { words, className } = props;
	const hydrated = useHydrated();

	@if (!hydrated) {
		<TextGenFallback words={words} className={className} />
	} @else {
		<INTERNAL_TextGenComponent words={words} className={className} />
	}
}
