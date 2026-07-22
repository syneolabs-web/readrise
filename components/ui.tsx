import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  color,
  image,
  size = 28,
  className,
}: {
  name: string;
  color: string;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        title={name}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full object-cover select-none",
          className
        )}
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-on-accent select-none",
        className
      )}
      style={{
        background: color,
        width: size,
        height: size,
        fontSize: size * 0.38,
      }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium",
        // Named properties, never `all`: `transition: all` also animates
        // layout-affecting properties, which costs frames and produces
        // transitions nobody asked for when an unrelated class changes.
        "[transition:transform_var(--dur-press)_var(--ease-out),background-color_var(--dur-micro)_ease,border-color_var(--dur-micro)_ease,color_var(--dur-micro)_ease]",
        // Press feedback. Every pressable surface must confirm it heard the
        // input — without it a button feels like a picture of a button. Kept
        // subtle (0.97) so it reads as depression, not as a bounce.
        "active:scale-[0.97]",
        // Disabled elements must not appear to respond.
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm",
        variant === "primary" &&
          "bg-accent text-on-accent hover:bg-accent/90 font-semibold",
        variant === "ghost" && "text-ink-300 hover:bg-ink-800 hover:text-ink-100",
        variant === "outline" &&
          "border border-ink-700 text-ink-200 hover:border-ink-600 hover:bg-ink-850",
        variant === "danger" && "text-red-400 hover:bg-red-500/10",
        className
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100",
        "placeholder:text-ink-500",
        "focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100",
        "placeholder:text-ink-500",
        "focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30",
        className
      )}
      {...props}
    />
  );
}

/**
 * A plate, in the atlas sense: a bounded region of record.
 *
 * Flatter and squarer than the card it replaces. The old 12px radius and
 * raised fill made every region read as a floating tile, which is the
 * arrangement this category always ships and which quietly says "each of these
 * is a separate thing". In an atlas the regions are pages of one document, so
 * the border does the bounding and the ground stays continuous.
 */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md border border-ink-800 bg-ink-900/60",
        className
      )}
      {...props}
    />
  );
}

/**
 * The caption that names a quantity.
 *
 * Archivo Narrow in tracked caps — the register a plate caption has in print.
 * It is deliberately quiet: a label that competes with its own figure has
 * inverted the hierarchy of the thing it is labelling.
 */
export function Label({ children }: { children: React.ReactNode }) {
  return <span className="plate-label">{children}</span>;
}

/**
 * A figure: the primary number in a region, set to be read down a column.
 *
 * Tabular by construction. `Datum` exists so no surface has to remember to
 * add `.fig` — the world's central rule is that every number in the product
 * is tabular, and a rule everyone must remember is a rule that will be broken.
 */
export function Datum({
  value,
  label,
  sub,
  className,
}: {
  value: React.ReactNode;
  label: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="fig font-display text-3xl font-semibold leading-none text-ink-100">
        {value}
      </p>
      <p className="plate-label mt-1.5">{label}</p>
      {sub && <p className="mt-0.5 text-2xs text-ink-500">{sub}</p>}
    </div>
  );
}

/**
 * A small multiple: seven days of activity, read at a glance.
 *
 * Bars rather than a line because the quantity is a count of discrete days,
 * and because a seven-point line implies a continuity that daily reading does
 * not have. Days with activity carry the accent; the rest are the reference
 * grid.
 */
export function Spark({
  data,
  className,
}: {
  data: { label: string; count: number }[];
  className?: string;
}) {
  const peak = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className={className}>
      <div className="spark" role="img" aria-label={
        data.map((d) => `${d.label}: ${d.count}`).join(", ")
      }>
        {data.map((d, i) => (
          <i
            key={i}
            data-on={d.count > 0}
            // Scale factor, not height — see the .spark rule in globals.css.
            style={{ "--h": Math.max(0.08, d.count / peak) } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="mt-1 flex gap-[2px]">
        {data.map((d, i) => (
          <span
            key={i}
            className="flex-1 text-center text-[0.65rem] leading-none text-ink-600"
            aria-hidden
          >
            {d.label[0]}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Empty({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      {icon && <div className="text-ink-600">{icon}</div>}
      <p className="text-sm font-medium text-ink-300">{title}</p>
      {hint && <p className="max-w-xs text-xs leading-relaxed text-ink-500">{hint}</p>}
    </div>
  );
}
