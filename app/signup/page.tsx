"use client";

import { useState } from "react";
import { AuthShell, AuthSwitchLink, Field, errorFrom, readNext } from "@/components/AuthShell";

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (name.length < 2) return setError("Your name needs at least 2 characters.");
    if (!email.includes("@")) return setError("That email doesn't look right — check for a typo.");
    if (password.length < 8) return setError("Use at least 8 characters for your password.");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error(await errorFrom(res, "Couldn't create your account. Try again."));
      window.location.href = readNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your account. Try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="cover-title text-[length:clamp(2.2rem,6vw,3.2rem)] leading-[0.98] text-ink-100">
        Start reading together.
      </h1>
      <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-ink-400">
        Free. Make a circle, bring any PDF, invite your friends.
      </p>

      <form className="mt-6 space-y-4.5" onSubmit={handleSubmit} noValidate>
        <Field
          label="Your name"
          id="name"
          type="text"
          required
          minLength={2}
          maxLength={40}
          autoComplete="name"
          placeholder="What your friends call you"
        />
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
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aside={<span className="text-[0.7rem] text-ink-500 font-medium">8+ characters</span>}
        />

        {error && (
          <div role="alert" className="rounded-xl border border-crit/30 bg-crit/10 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-crit">
            {error}
            {/already exists/i.test(error) && (
              <>
                {" "}
                <AuthSwitchLink to="/login">Sign in instead</AuthSwitchLink>
              </>
            )}
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
          <span>{isSubmitting ? "Creating account…" : "Create account"}</span>
        </button>
      </form>

      <p className="mt-7 border-t border-ink-800/80 pt-5 text-center text-sm text-ink-400">
        Already have an account? <AuthSwitchLink to="/login">Sign in</AuthSwitchLink>
      </p>
    </AuthShell>
  );
}
