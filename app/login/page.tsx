"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, AuthSwitchLink, Field, errorFrom, readNext } from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function attemptLogin(email: string, password: string) {
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      // The API answers `{ error }`. This read `message`, which never
      // exists, so every failure showed the same fallback text.
      if (!res.ok) throw new Error(await errorFrom(res, "Incorrect email or password."));
      router.push(readNext());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in. Try again.");
      setIsSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    attemptLogin(String(data.get("email") ?? ""), String(data.get("password") ?? ""));
  }

  return (
    <AuthShell>
      <h1 className="cover-title text-[length:clamp(2.4rem,8vw,3.4rem)] text-ink-100">Welcome back.</h1>
      <p className="mt-3 text-base leading-relaxed text-ink-400">
        Your circle saved your page.
      </p>

      {/* Development only: one-tap logins for the seeded accounts. Next
          inlines NODE_ENV at build time and drops this block from production,
          where it would advertise logins that don't exist. */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-6 flex flex-wrap items-center gap-2 border-y border-dashed border-ink-700 py-3">
          <span className="cover-label mr-1 text-2xs font-bold uppercase tracking-[0.14em] text-ink-500">
            Dev logins
          </span>
          {[
            ["Pratik", "pratik@prodoxity.dev"],
            ["Maya", "maya@prodoxity.dev"],
            ["Dev", "dev@prodoxity.dev"],
            // Sofia reads public circles — for testing joins and standings
            // from a non-owner's point of view.
            ["Sofia", "sofia@readers.dev"],
          ].map(([name, email]) => (
            <button
              key={email}
              type="button"
              onClick={() => attemptLogin(email!, "password123")}
              className="rounded-[3px] border border-ink-700 px-2.5 py-1 text-xs font-semibold text-ink-300 transition-colors duration-[120ms] hover:border-ink-400 hover:text-ink-100"
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
        <Field
          label="Email"
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@example.com"
        />
        <Field
          label="Password"
          id="password"
          type="password"
          required
          autoComplete="current-password"
        />

        {error && (
          <p role="alert" className="text-sm font-medium text-crit">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="cover-label flex w-full items-center justify-center gap-2 rounded-[3px] bg-series px-4 py-3.5 text-base font-bold text-series-ink [transition:transform_var(--dur-press)_var(--ease-out)] active:scale-[0.98] disabled:opacity-70"
        >
          {isSubmitting && (
            <span className="animate-spin-slow h-4 w-4 rounded-full border-2 border-series-ink/30 border-t-series-ink" aria-hidden="true" />
          )}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 border-t border-ink-800 pt-5 text-sm text-ink-400">
        New to Readrise? <AuthSwitchLink to="/signup">Create an account</AuthSwitchLink>
      </p>
    </AuthShell>
  );
}
