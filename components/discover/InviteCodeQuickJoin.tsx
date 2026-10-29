"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrow, IconLock, IconSparkles } from "@/components/icons";

export function InviteCodeQuickJoin() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsJoining(true);
    setError(null);

    try {
      const res = await fetch("/api/circles/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid invite code");
      }

      router.push(`/circles/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't join circle");
      setIsJoining(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-800/80 bg-ink-950/60 p-3.5 sm:p-4 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-ink-300">
        <IconLock size={13} className="text-accent" />
        <span>Have a Circle Invite Code?</span>
      </div>
      <p className="mt-1 text-3xs text-ink-400">
        Enter your friends&apos; secret code to unlock their reading room
      </p>

      <form onSubmit={handleJoin} className="mt-2.5 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            placeholder="e.g. READ-7890"
            maxLength={16}
            className="w-full rounded-xl border border-ink-700/80 bg-ink-900 px-3.5 py-2 font-mono text-xs text-ink-100 placeholder:text-ink-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent tracking-wider uppercase"
          />
        </div>

        <button
          type="submit"
          disabled={!code.trim() || isJoining}
          className="cover-label inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-series px-4 py-2 text-xs font-bold text-series-ink shadow-xs transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isJoining ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-series-ink/30 border-t-series-ink" />
          ) : (
            <>
              <span>Join Circle</span>
              <IconArrow size={12} />
            </>
          )}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-2 text-3xs font-medium text-crit">
          {error}
        </p>
      )}
    </div>
  );
}
