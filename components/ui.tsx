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
          "inline-flex shrink-0 items-center justify-center rounded-full object-cover select-none ring-1 ring-white/10",
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
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-on-accent select-none shadow-sm",
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
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(
        // Modern curved geometry with fluid spring physics
        "inline-flex items-center justify-center gap-2 rounded-full font-bold select-none cursor-pointer",
        "[transition:transform_var(--dur-press)_var(--ease-out),background-color_var(--dur-micro)_ease,border-color_var(--dur-micro)_ease,color_var(--dur-micro)_ease,box-shadow_var(--dur-micro)_ease]",
        "active:scale-[0.97]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        size === "sm" && "px-3.5 py-1.5 text-xs",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        variant === "primary" &&
          "bg-series text-series-ink shadow-[0_4px_14px_-2px_var(--series)] hover:shadow-[0_6px_20px_-2px_var(--series)] hover:brightness-105",
        variant === "ghost" && "text-ink-300 hover:bg-ink-800/60 hover:text-ink-100",
        variant === "outline" &&
          "border border-ink-700/80 text-ink-200 hover:border-ink-500 hover:bg-ink-850/50 hover:text-ink-100 shadow-sm",
        variant === "danger" && "text-crit hover:bg-crit/15 border border-crit/30",
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
        "w-full rounded-xl border border-ink-700/80 bg-ink-900/90 px-4 py-2.5 text-sm text-ink-100 shadow-inner",
        "placeholder:text-ink-500",
        "transition-all duration-150",
        "focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none",
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
        "w-full resize-none rounded-xl border border-ink-700/80 bg-ink-900/90 px-4 py-2.5 text-sm text-ink-100 shadow-inner",
        "placeholder:text-ink-500",
        "transition-all duration-150",
        "focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

/**
 * Modern Card: double-bezel curved plate with subtle border and inner light.
 */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-800/80 bg-ink-900/60 backdrop-blur-md shadow-sm transition-all duration-200 hover:border-ink-700/70",
        className
      )}
      {...props}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <span className="plate-label">{children}</span>;
}

export function SectionHead({ id, title }: { id?: string; title: string }) {
  return (
    <h2 id={id} className="cover-label text-xs font-bold uppercase tracking-[0.14em] text-ink-400">
      {title}
    </h2>
  );
}

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
      <p className="plate-label mt-2">{label}</p>
      {sub && <p className="mt-0.5 text-2xs text-ink-500">{sub}</p>}
    </div>
  );
}

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
            style={{ "--h": Math.max(0.08, d.count / peak) } as React.CSSProperties}
            className="rounded-t-sm"
          />
        ))}
      </div>
      <div className="mt-1 flex gap-[2px]">
        {data.map((d, i) => (
          <span
            key={i}
            className="flex-1 text-center text-[0.65rem] leading-none text-ink-600 font-semibold"
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
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-800/80 px-6 py-12 text-center bg-ink-950/40">
      {icon && <div className="text-ink-500">{icon}</div>}
      <p className="text-sm font-semibold text-ink-200">{title}</p>
      {hint && <p className="max-w-xs text-xs leading-relaxed text-ink-500">{hint}</p>}
    </div>
  );
}
