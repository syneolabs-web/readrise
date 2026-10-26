/**
 * The publisher's mark, set the way a paperback sets its colophon: the
 * Readrise sun-over-an-open-book, drawn in one stroke weight inside an oval
 * cartouche. currentColor throughout, so it prints in whatever ink the band
 * it sits on uses — black on orange, white on blue, ink on paper.
 */
export function ColophonMark({
  className = "",
  title = "Readrise",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...(title
        ? { role: "img", "aria-label": title }
        : { "aria-hidden": true })}
    >
      <ellipse cx="24" cy="16" rx="22.5" ry="14.5" />
      {/* the sun, rising out of the gutter */}
      <path d="M17.5 17.5a6.5 6.5 0 0 1 13 0" />
      <path d="M24 6.5v2.5M16.2 9.6l1.7 1.7M31.8 9.6l-1.7 1.7" />
      {/* the open book it rises from */}
      <path d="M12.5 19.5c3.8-1.8 7.7-1.8 11.5 0c3.8-1.8 7.7-1.8 11.5 0v5c-3.8-1.8-7.7-1.8-11.5 0c-3.8-1.8-7.7-1.8-11.5 0z" />
      <path d="M24 19.5v5" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`cover-label inline-flex items-center gap-2.5 ${className}`}>
      <ColophonMark className="h-7 w-auto shrink-0" title="" />
      <span className="text-lg font-bold tracking-tight">Readrise</span>
    </span>
  );
}
