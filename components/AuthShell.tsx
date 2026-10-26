"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/landing/Colophon";
import { ThemeMenu } from "@/components/ThemeMenu";

/**
 * Modernized AuthShell: Curved editorial layout with double-bezel photo frame,
 * frosted glass form enclosure, and refined typography.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100svh] bg-ink-950 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* Left Aside: Brand & Visual World */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-series text-series-ink p-10 lg:flex">
        {/* Subtle decorative radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-32 h-[35rem] w-[35rem] rounded-full bg-white/10 blur-[100px]"
        />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" aria-label="Readrise home" className="rounded-full transition-opacity hover:opacity-90">
            <Wordmark />
          </Link>
          <span className="cover-label rounded-full bg-black/15 px-3 py-1 text-xs uppercase tracking-[0.14em]">
            A reading circle for friends
          </span>
        </div>

        {/* Double-Bezel Image Card */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="w-full max-w-lg rounded-[2.5rem] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-md">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[calc(2.5rem-0.75rem)] bg-white/5 shadow-inner">
              <Image
                src="/hero_reading_circle.webp"
                alt="Friends reading together with books and tablet"
                fill
                priority
                sizes="45vw"
                className="object-cover object-[50%_35%]"
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="cover-title text-[length:clamp(2.4rem,4vw,3.6rem)] leading-[0.98]">
              Read together. Rise together.
            </p>
            <p className="mt-2 text-sm opacity-90">
              The anti-feed for close friends reading with intent.
            </p>
          </div>
        </div>

        <div className="relative z-10 border-t border-series-ink/20 pt-4">
          <p className="cover-label text-xs uppercase tracking-[0.16em] opacity-80">
            Read · Highlight · Discuss · Commit · Check in · Keep
          </p>
        </div>
      </aside>

      {/* Right Column: Form Canvas */}
      <div className="flex min-h-[100svh] flex-col justify-between">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" aria-label="Readrise home" className="rounded-full text-ink-100 lg:invisible">
            <Wordmark />
          </Link>
          <ThemeMenu />
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-md rounded-3xl border border-ink-800/80 bg-ink-900/50 p-7 sm:p-9 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            {children}
          </div>
        </div>

        <footer className="px-6 py-4 text-center text-xs text-ink-500">
          Readrise &copy; {new Date().getFullYear()} &middot; Private reading circles
        </footer>
      </div>
    </main>
  );
}

/** Modernized labelled field with smooth rounded corners and focus ring. */
export function Field({
  label,
  id,
  aside,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; aside?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="cover-label text-xs font-bold uppercase tracking-[0.12em] text-ink-300">
          {label}
        </label>
        {aside}
      </div>
      <input
        id={id}
        name={id}
        {...input}
        className="mt-2 w-full rounded-xl border border-ink-700/80 bg-ink-950/80 px-4 py-3 text-base text-ink-100 placeholder:text-ink-500 shadow-inner transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
      />
    </div>
  );
}

export function readNext(fallback = "/circles"): string {
  if (typeof window === "undefined") return fallback;
  const raw = new URLSearchParams(window.location.search).get("next");
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}

export function AuthSwitchLink({ to, children }: { to: "/login" | "/signup"; children: React.ReactNode }) {
  const [href, setHref] = useState<string>(to);
  useEffect(() => {
    const next = readNext("");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (next) setHref(`${to}?next=${encodeURIComponent(next)}`);
  }, [to]);
  return (
    <Link href={href} className="font-bold text-accent underline underline-offset-4 hover:brightness-110 transition-colors">
      {children}
    </Link>
  );
}

export async function errorFrom(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  return (data && typeof data.error === "string" && data.error) || fallback;
}
