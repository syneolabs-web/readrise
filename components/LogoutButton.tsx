"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      aria-label="Sign out"
      title="Sign out of Readrise"
      className={cn(
        "group relative inline-flex items-center gap-1.5 rounded-full border border-ink-800/80 bg-ink-900/80 px-2.5 py-1 text-xs font-medium text-ink-400 shadow-2xs transition-all duration-150 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 active:scale-95 disabled:opacity-60 cursor-pointer",
        className
      )}
    >
      {isLoggingOut ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
      ) : (
        <LogOut
          size={13}
          strokeWidth={1.8}
          className="transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:text-red-400"
        />
      )}
      <span className="hidden sm:inline font-sans text-3xs font-semibold tracking-wide">
        {isLoggingOut ? "Signing out…" : "Sign out"}
      </span>
    </button>
  );
}
