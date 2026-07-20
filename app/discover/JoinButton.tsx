"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

/** Joins a public circle by slug, then drops the user into it. */
export function JoinButton({ slug, joined }: { slug: string; joined: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (joined) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push(`/circles/${slug}`)}>
        Open
      </Button>
    );
  }

  async function join() {
    setBusy(true);
    const res = await fetch(`/api/circles/${slug}/join`, { method: "POST" });
    if (res.ok) {
      router.push(`/circles/${slug}`);
    } else {
      setBusy(false);
    }
  }

  return (
    <Button size="sm" onClick={join} disabled={busy}>
      {busy ? "…" : "Join"}
    </Button>
  );
}
