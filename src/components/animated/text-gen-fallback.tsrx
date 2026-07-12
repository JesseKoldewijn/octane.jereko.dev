export function TextGenFallback(props) @{
	const { words, className } = props;
	const wordsArray = words.split(' ').filter(Boolean);

	<div class={className} data-pathname-key="">
		<div class="mt-4">
			<div class="text-2xl leading-snug tracking-wide text-black dark:text-white">
				<div>
					@for (const entry of wordsArray.map((word, idx) => ({ word, key: word + idx })); key entry.key) {
						<span class="text-black opacity-0 dark:text-white">{`${entry.word} `}</span>
					}
				</div>
			</div>
		</div>
	</div>
}
