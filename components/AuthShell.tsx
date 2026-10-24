"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/landing/Colophon";
import { ThemeMenu } from "@/components/ThemeMenu";

/**
 * The door into the app, printed as the front of the book.
 *
 * Wide screens: the cover on the left (series band, the picture, the title),
 * the form on the paper side. Phones: just the band and the form — the form
 * is the job and gets the whole screen.
 *
 * Login and signup used to be their own world: rounded glass cards, a
 * hard-coded amber, a different header. Same shell, same tokens now.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100svh] bg-ink-950 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col bg-series text-series-ink lg:flex">
        <div className="flex items-center justify-between px-10 py-6">
          <Link href="/" aria-label="Readrise home" className="rounded-sm">
            <Wordmark />
          </Link>
          <span className="cover-label text-xs uppercase tracking-[0.16em]">A reading circle for friends</span>
        </div>
        <div className="flex flex-1 flex-col justify-center px-10 pb-10">
          <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden border-[6px] border-cover-paper shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
            <Image
              src="/avatar_innovating.png"
              alt=""
              fill
              priority
              sizes="45vw"
              className="object-cover object-[50%_35%]"
            />
          </div>
          <p className="cover-title mt-10 max-w-[14ch] text-[length:clamp(2.6rem,4.4vw,4.4rem)]">
            Read together. Rise together.
          </p>
        </div>
        <div className="border-t border-series-ink/25 px-10 py-4">
          <p className="cover-label text-xs uppercase tracking-[0.16em]">
            Read · Highlight · Discuss · Commit · Check in · Keep
          </p>
        </div>
      </aside>

      <div className="flex min-h-[100svh] flex-col">
        <div className="flex items-center justify-between border-t-[3px] border-t-series px-5 py-4 lg:border-t-0 lg:px-10 lg:py-6">
          <Link href="/" aria-label="Readrise home" className="rounded-sm text-ink-100 lg:invisible">
            <Wordmark />
          </Link>
          <ThemeMenu />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-16 pt-6 sm:px-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </main>
  );
}

/** A labelled field in the shell's register. */
export function Field({
  label,
  id,
  aside,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; aside?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="cover-label text-sm font-semibold text-ink-200">
          {label}
        </label>
        {aside}
      </div>
      <input
        id={id}
        name={id}
        {...input}
        className="mt-2 w-full rounded-[3px] border border-ink-700 bg-ink-900 px-3.5 py-3 text-base text-ink-100 placeholder:text-ink-600 [transition:border-color_var(--dur-micro)_ease] focus:border-ink-300 focus:outline-none"
      />
    </div>
  );
}

/**
 * Same-origin `next` path from the URL, or the fallback.
 *
 * Read from window.location rather than useSearchParams(): that hook forces a
 * Suspense boundary during static prerender and fails the build for a page
 * that is otherwise static (D28). Only same-origin paths are honoured — an
 * open redirect is a phishing gift.
 */
export function readNext(fallback = "/circles"): string {
  if (typeof window === "undefined") return fallback;
  const raw = new URLSearchParams(window.location.search).get("next");
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}

/**
 * A link to the other auth page that keeps `?next=` — so a friend who
 * arrived from an invite link and picks "I already have an account" (or the
 * reverse) still lands in the circle that invited them.
 */
export function AuthSwitchLink({ to, children }: { to: "/login" | "/signup"; children: React.ReactNode }) {
  const [href, setHref] = useState<string>(to);
  useEffect(() => {
    const next = readNext("");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (next) setHref(`${to}?next=${encodeURIComponent(next)}`);
  }, [to]);
  return (
    <Link href={href} className="font-semibold text-ink-100 underline underline-offset-4 hover:text-accent">
      {children}
    </Link>
  );
}

/** Pulls the API's `{ error }` message out of a failed response. */
export async function errorFrom(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  return (data && typeof data.error === "string" && data.error) || fallback;
}
