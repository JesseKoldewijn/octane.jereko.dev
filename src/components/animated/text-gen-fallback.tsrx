type TextGenFallbackProps = {
	words: string;
	className?: string;
};

export function TextGenFallback(props: TextGenFallbackProps) @{
	const { words, className } = props;

	<div class={className} data-pathname-key="">
		<div class="mt-4">
			<div class="text-2xl leading-snug tracking-wide text-black dark:text-white">
				{words as string}
			</div>
		</div>
	</div>
}
