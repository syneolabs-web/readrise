/**
 * The publisher's mark & wordmark for Readrise.
 *
 * Designed with golden-ratio geometry, architectural bookbinding lineage,
 * and high-end editorial prestige (Penguin, Faber, Criterion):
 * - Cartouche: Golden stadium seal with optical curvature (rx="13")
 * - Colophon: Majestic open codex with a 5-ray radiant rising sun in currentColor
 * - Wordmark: Muscular Archivo display typography with surgical optical tracking
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
      viewBox="0 0 44 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...(title
        ? { role: "img", "aria-label": title }
        : { "aria-hidden": true })}
    >
      {/* Outer Stadium Cartouche Seal */}
      <rect
        x="1"
        y="1"
        width="42"
        height="26"
        rx="13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.85"
      />

      {/* Radiant Sunrise with 5 Proportioned Solar Beams */}
      <path
        d="M 17.5 15.5 A 4.5 4.5 0 0 1 26.5 15.5 Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* 5 Solar Beams */}
      <path d="M 22 5.8 V 8.2" />
      <path d="M 17.2 7 L 18.6 9.2" />
      <path d="M 26.8 7 L 25.4 9.2" />
      <path d="M 13.5 10.2 L 15.5 11.6" />
      <path d="M 30.5 10.2 L 28.5 11.6" />

      {/* Architectural Open Book Folio */}
      <path
        d="M 10.5 16 C 14.5 14.2 18 14.5 22 16.5 C 26 14.5 29.5 14.2 33.5 16 V 20.8 C 29.5 19 26 19.3 22 21.5 C 18 19.3 14.5 19 10.5 20.8 Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M 22 16.5 V 21.5" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`group inline-flex items-center gap-2.5 select-none ${className}`}
      aria-label="Readrise"
    >
      <ColophonMark
        className="h-7 w-auto shrink-0 transition-transform duration-200 group-hover:scale-105"
        title=""
      />
      <span className="font-display text-[1.2rem] font-black tracking-[-0.035em] leading-none text-current">
        Readrise
      </span>
    </span>
  );
}
