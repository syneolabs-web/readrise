"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, AuthSwitchLink, Field, errorFrom, readNext } from "@/components/AuthShell";

export default function SignupPage() {
  const router = useRouter();
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
      // `{ error }` from the API — e.g. "An account with that email already
      // exists", which used to be swallowed into "Failed to sign up".
      if (!res.ok) throw new Error(await errorFrom(res, "Couldn't create your account. Try again."));
      router.push(readNext());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your account. Try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="cover-title text-[length:clamp(2.4rem,8vw,3.4rem)] text-ink-100">Start reading together.</h1>
      <p className="mt-3 text-base leading-relaxed text-ink-400">
        Free. Make a circle, bring a PDF, send your friends the link.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
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
          aside={<span className="text-xs text-ink-500">8+ characters</span>}
        />

        {error && (
          <p role="alert" className="text-sm font-medium text-crit">
            {error}
            {/* The one error with an obvious next step gets the step. */}
            {/already exists/i.test(error) && (
              <>
                {" "}
                <AuthSwitchLink to="/login">Sign in instead</AuthSwitchLink>
              </>
            )}
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
          {isSubmitting ? "Creating your account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 border-t border-ink-800 pt-5 text-sm text-ink-400">
        Already reading with us? <AuthSwitchLink to="/login">Sign in</AuthSwitchLink>
      </p>
    </AuthShell>
  );
}
