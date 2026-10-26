"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

/**
 * Modernized InviteField: A sleek curved pill with nested circular action button.
 */
export function InviteField({ tone = "paper" }: { tone?: "paper" | "band" }) {
  const router = useRouter();
  const id = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length < 4) {
      setError("Invite codes are 8 letters & numbers — check the link your friend sent.");
      return;
    }
    setError("");
    setPending(true);
    router.push(`/join/${encodeURIComponent(clean)}`);
  }

  const band = tone === "band";

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <label
        htmlFor={id}
        className={`cover-label block text-[0.72rem] font-bold uppercase tracking-[0.14em] ${
          band ? "text-series-ink/80" : "text-cover-ink-soft"
        }`}
      >
        Got an invite code?
      </label>
      <div
        className={`mt-2 flex items-center p-1.5 pl-4.5 rounded-full border transition-all duration-200 shadow-sm ${
          band
            ? "bg-black/15 border-series-ink/30 focus-within:border-series-ink focus-within:ring-2 focus-within:ring-series-ink/20"
            : "bg-cover-paper/90 dark:bg-white/[0.05] border-cover-rule/60 dark:border-white/10 focus-within:border-series focus-within:ring-4 focus-within:ring-series/15"
        }`}
      >
        <input
          id={id}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError("");
          }}
          maxLength={12}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="e.g. K7QM2PXA"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`fig min-w-0 flex-1 bg-transparent py-2.5 text-sm sm:text-base font-semibold tracking-[0.2em] outline-none placeholder:font-normal placeholder:tracking-[0.08em] ${
            band
              ? "text-series-ink placeholder:text-series-ink/50"
              : "text-cover-ink placeholder:text-cover-ink-soft/60"
          }`}
          style={{ outline: "none" }}
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Join circle with this code"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all duration-200 active:scale-90 disabled:opacity-60 shadow-sm ${
            band
              ? "bg-series-ink text-series hover:scale-105 hover:opacity-95"
              : "bg-cover-ink text-cover-paper hover:scale-105 hover:opacity-90"
          }`}
        >
          <ArrowRight size={17} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p
          id={`${id}-err`}
          role="alert"
          className={`mt-2 text-xs font-medium ${
            band ? "text-series-ink" : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {error}
        </p>
      )}
    </form>
  );
}
