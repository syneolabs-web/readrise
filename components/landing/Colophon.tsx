/**
 * The publisher's mark & wordmark for Readrise.
 *
 * Designed with geometric precision, authentic bookbinding lineage, and modern luxury craft:
 * - Cartouche: Golden stadium seal with balanced optical curvature
 * - Insignia: Sculptural codex wings framing the rising dawn, catching the visitor's dynamic Series vibe
 * - Wordmark: Editorial grotesk typography with custom optical tracking and a glowing series sunrise dot on the 'i'
 */
export function ColophonMark({
  className = "",
  title = "Readrise",
  monochrome = false,
}: {
  className?: string;
  title?: string;
  monochrome?: boolean;
}) {
  const sunColor = monochrome ? "currentColor" : "var(--series, currentColor)";

  return (
    <svg
      viewBox="0 0 42 28"
      fill="none"
      className={className}
      {...(title
        ? { role: "img", "aria-label": title }
        : { "aria-hidden": true })}
    >
      {/* Outer Stadium Cartouche Seal */}
      <rect
        x="1"
        y="1"
        width="40"
        height="26"
        rx="13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />

      {/* Radiant Sunrise (Dynamically connects to the series vibe) */}
      <circle cx="21" cy="14" r="4.2" fill={sunColor} />
      <path
        d="M 21 6.2 V 7.8"
        stroke={sunColor}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M 14.8 8.2 L 16.2 9.6"
        stroke={sunColor}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M 27.2 8.2 L 25.8 9.6"
        stroke={sunColor}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Sculptural Open Book Leaves (with optical negative-space spine) */}
      {/* Left Leaf */}
      <path
        d="M 19.8 16.2 C 15.5 13.8 11.2 14.5 8 16 V 20.8 C 11.2 19.5 15.5 19 19.8 21.2 Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      {/* Right Leaf */}
      <path
        d="M 22.2 16.2 C 26.5 13.8 30.8 14.5 34 16 V 20.8 C 30.8 19.5 26.5 19 22.2 21.2 Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
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
      <span className="font-display text-[1.18rem] font-black tracking-[-0.035em] leading-none text-current flex items-baseline">
        Readr
        <span aria-hidden="true" className="relative inline-block">
          ı
          <span className="absolute -top-[0.16em] left-1/2 -translate-x-1/2 h-[0.24em] w-[0.24em] rounded-full bg-series shadow-[0_0_8px_var(--series)] transition-transform duration-200 group-hover:scale-125" />
        </span>
        se
      </span>
    </span>
  );
}
