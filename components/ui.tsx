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
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-45",
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

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-ink-800 bg-ink-900", className)}
      {...props}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">
      {children}
    </span>
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
