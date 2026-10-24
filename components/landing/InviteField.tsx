"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

/**
 * The working action for the visitor who arrived because a friend sent them:
 * type the code, land on /join/CODE, which shows them which circle invited
 * them and carries the code through sign-up (D28). On a landing for an
 * invite-only product, this field IS the conversion path for half the
 * visitors — so it lives on the cover, not behind a link.
 *
 * `tone` picks the ink: "paper" sits on the cover's paper band, "band" on a
 * flat series-colour band.
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
      setError("Invite codes are 8 letters and numbers — it's in the link your friend sent.");
      return;
    }
    setError("");
    setPending(true);
    router.push(`/join/${encodeURIComponent(clean)}`);
  }

  const band = tone === "band";

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-sm">
      <label
        htmlFor={id}
        className={`cover-label block text-xs uppercase tracking-[0.12em] ${
          band ? "text-series-ink/80" : "text-cover-ink-soft"
        }`}
      >
        Got an invite code?
      </label>
      <div
        className={`mt-2 flex items-stretch border-2 transition-colors duration-[120ms] ${
          band
            ? "border-series-ink/70 focus-within:border-series-ink"
            : "border-cover-ink/25 focus-within:border-cover-ink"
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
          className={`fig min-w-0 flex-1 bg-transparent px-3.5 py-3 text-base font-semibold tracking-[0.18em] outline-none placeholder:font-normal placeholder:tracking-[0.08em] ${
            band
              ? "text-series-ink placeholder:text-series-ink/55"
              : "text-cover-ink placeholder:text-cover-ink-soft/70"
          }`}
          style={{ outline: "none" }}
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Join with this code"
          className={`grid w-12 place-items-center transition-[background-color,transform] duration-[140ms] active:scale-[0.96] disabled:opacity-60 ${
            band
              ? "bg-series-ink text-series hover:opacity-90"
              : "bg-cover-ink text-cover-paper hover:opacity-90"
          }`}
        >
          <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
      <p
        id={`${id}-err`}
        role="alert"
        className={`mt-2 min-h-[1.25rem] text-sm ${
          band ? "text-series-ink" : "text-cover-ink"
        }`}
      >
        {error}
      </p>
    </form>
  );
}
