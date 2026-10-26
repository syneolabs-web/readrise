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
      <h1 className="cover-title text-[length:clamp(2.2rem,6vw,3.2rem)] leading-[0.98] text-ink-100">
        Welcome back.
      </h1>
      <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-ink-400">
        Your circle saved your page.
      </p>

      {/* Dev logins for rapid testing */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-5 rounded-2xl border border-dashed border-ink-800 bg-ink-950/40 p-3.5">
          <p className="cover-label mb-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-500">
            One-tap dev logins
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              ["Pratik", "pratik@prodoxity.dev"],
              ["Maya", "maya@prodoxity.dev"],
              ["Dev", "dev@prodoxity.dev"],
              ["Sofia", "sofia@readers.dev"],
            ].map(([name, email]) => (
              <button
                key={email}
                type="button"
                onClick={() => attemptLogin(email!, "password123")}
                className="rounded-full border border-ink-700/80 bg-ink-900/80 px-3 py-1 text-xs font-semibold text-ink-300 transition-all duration-150 hover:border-accent hover:text-ink-100 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="mt-6 space-y-4.5" onSubmit={handleSubmit} noValidate>
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
          placeholder="••••••••"
        />

        {error && (
          <div role="alert" className="rounded-xl border border-crit/30 bg-crit/10 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-crit">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="cover-label mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-series px-6 py-4 text-base font-bold text-series-ink shadow-[0_10px_25px_-5px_var(--series)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_15px_30px_-5px_var(--series)] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-series-ink/30 border-t-series-ink" aria-hidden="true" />
          )}
          <span>{isSubmitting ? "Signing in…" : "Sign in"}</span>
        </button>
      </form>

      <p className="mt-7 border-t border-ink-800/80 pt-5 text-center text-sm text-ink-400">
        New to Readrise? <AuthSwitchLink to="/signup">Create an account</AuthSwitchLink>
      </p>
    </AuthShell>
  );
}
