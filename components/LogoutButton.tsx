"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      // whitespace-nowrap: at narrow widths this wrapped to two lines and
      // pushed the header taller than its own row.
      className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium text-ink-400 transition-all hover:bg-ink-850 hover:text-ink-100 cursor-pointer"
    >
      Sign out
    </button>
  );
}
