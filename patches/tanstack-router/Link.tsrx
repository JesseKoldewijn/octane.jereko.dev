// Patched Link.tsrx — octane@0.1.3 lacks isChildrenBlock export.
import { useLinkProps } from './link.ts';

function isChildrenBlock(_value) {
  return false;
}

export function Link(props) @{
	const { _asChild: AsChild, children, ...rest } = props;
	const linkProps = useLinkProps(rest);
	const { disabled: _disabled, ...aProps } = linkProps;

	const resolvedChildren =
		typeof children === 'function' && !isChildrenBlock(children)
			? children({
					isActive: linkProps['data-status'] === 'active',
					isTransitioning: linkProps['data-transitioning'] === 'transitioning',
				})
			: children;

	@if (AsChild) {
		<AsChild {...linkProps}>{resolvedChildren}</AsChild>
	} @else {
		<a {...aProps}>{resolvedChildren}</a>
	}
}
