import { cn } from "@/lib/utils";

/**
 * A circular progress ring with a value in the centre — extracted from the
 * reference "My Progress" dashboard.
 *
 * On-brand only because it shows the CIRCLE's own accumulated work (streak,
 * insights, books), never a global or competitive metric. It uses the vibe
 * gradient via `.text-grad` on the number, so it re-skins with the theme.
 *
 * `fraction` (0..1) fills the arc; pass 1 for a pure count with no goal.
 */
export function StatRing({
  value,
  label,
  sub,
  fraction = 1,
  icon,
  className,
}: {
  value: string | number;
  label: string;
  sub?: string;
  fraction?: number;
  icon?: React.ReactNode;
  className?: string;
}) {
  const size = 64;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, fraction));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-ink-800)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - filled)}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          {icon ? (
            <span className="text-accent">{icon}</span>
          ) : (
            // Sans, lining tabular figures: data is the tool's voice (D11), and
            // Cormorant's oldstyle "1" reads as "I" — wrong for a number.
            <span className="text-xl font-semibold leading-none text-ink-100 [font-variant-numeric:lining-nums_tabular-nums]">
              {value}
            </span>
          )}
        </div>
      </div>
      <div className="min-w-0">
        {icon && (
          <p className="text-lg font-semibold leading-none text-ink-100 [font-variant-numeric:lining-nums_tabular-nums]">
            {value}
          </p>
        )}
        <p className="text-xs font-medium text-ink-200">{label}</p>
        {sub && <p className="text-2xs text-ink-500">{sub}</p>}
      </div>
    </div>
  );
}
