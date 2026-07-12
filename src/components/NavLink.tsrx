/** Internal navigation link — full document navigation (SSR-friendly, no client router). */
export function NavLink(props: {
  to: string;
  class?: string;
  className?: string;
  id?: string;
  testId?: string;
  label?: string;
  children?: unknown;
  target?: string;
  rel?: string;
}) @{
  const { to, class: classProp, className, id, testId, label, children, target, rel } = props;
  const text = label ?? children;

  <a
    href={to}
    id={id}
    data-testid={testId}
    class={className ?? classProp}
    target={target}
    rel={rel}
    suppressHydrationWarning
  >
    {text}
  </a>
}
