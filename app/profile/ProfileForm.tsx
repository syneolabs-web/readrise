"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import { Field, errorFrom } from "@/components/AuthShell";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Initials colours. User content (how friends see you), not chrome. */
const COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Emerald", value: "#10b981" },
  { name: "Rose", value: "#f43f5e" },
];

const AVATARS = [
  "/avatars/avatar_1_1784439300343.png",
  "/avatars/avatar_2_1784439312430.png",
  "/avatars/avatar_3_1784439324465.png",
  "/avatars/avatar_4_1784439342654.png",
  "/avatars/avatar_5_1784439355039.png",
  "/avatars/avatar_6_1784439367868.png",
  "/avatars/avatar_7_1784439385170.png",
  "/avatars/avatar_8_1784439397694.png",
  "/avatars/avatar_9_1784439409906.png",
  "/avatars/avatar_10_1784439421671.png",
];

export function ProfileForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || COLORS[0]!.value);
  const [avatarImage, setAvatarImage] = useState<string | null>(user.avatarImage || null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: password || undefined,
      avatarColor,
      // null clears the picture. Sending undefined (as this did) means "no
      // change" to the API, so choosing initials again silently did nothing.
      avatarImage,
    };

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      // The API answers `{ error }`; this used to read `message`.
      if (!res.ok) throw new Error(await errorFrom(res, "Couldn't save your profile. Try again."));
      setMessage({ type: "success", text: "Saved." });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't save." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" id="name" type="text" defaultValue={user.name} required maxLength={40} autoComplete="name" />
        <Field label="Email" id="email" type="email" defaultValue={user.email} required autoComplete="email" />
      </div>

      <fieldset>
        <legend className="cover-label text-sm font-semibold text-ink-200">How friends see you</legend>
        <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-3" role="radiogroup" aria-label="Avatar">
          <button
            type="button"
            role="radio"
            aria-checked={avatarImage === null}
            aria-label="Use my initials"
            onClick={() => setAvatarImage(null)}
            className={cn(
              "grid h-14 w-14 shrink-0 snap-start place-items-center rounded-full text-base font-bold text-white transition-transform duration-[140ms] active:scale-95",
              avatarImage === null ? "ring-2 ring-ink-100 ring-offset-2 ring-offset-ink-950" : "opacity-80 hover:opacity-100"
            )}
            style={{ backgroundColor: avatarColor }}
          >
            {initials(user.name)}
          </button>
          {AVATARS.map((img, i) => (
            <button
              key={img}
              type="button"
              role="radio"
              aria-checked={avatarImage === img}
              aria-label={`Illustrated avatar ${i + 1}`}
              onClick={() => setAvatarImage(img)}
              className={cn(
                "h-14 w-14 shrink-0 snap-start rounded-full transition-transform duration-[140ms] active:scale-95",
                avatarImage === img ? "ring-2 ring-ink-100 ring-offset-2 ring-offset-ink-950" : "opacity-80 hover:opacity-100"
              )}
            >
              <img src={img} alt="" className="h-full w-full rounded-full object-cover" />
            </button>
          ))}
        </div>

        {avatarImage === null && (
          <div className="mt-3">
            <p className="text-xs text-ink-500">Initials colour</p>
            <div className="mt-2 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Initials colour">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={avatarColor === c.value}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => setAvatarColor(c.value)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-transform duration-[140ms] active:scale-95",
                    avatarColor === c.value && "ring-2 ring-ink-100 ring-offset-2 ring-offset-ink-950"
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <div className="border-t border-ink-800 pt-6">
        <Field
          label="New password"
          id="password"
          type="password"
          minLength={8}
          autoComplete="new-password"
          aside={<span className="text-xs text-ink-500">Leave blank to keep yours</span>}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="cover-label rounded-[3px] bg-series px-6 py-3 text-base font-bold text-series-ink [transition:transform_var(--dur-press)_var(--ease-out)] active:scale-[0.98] disabled:opacity-70"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
        {message && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={cn("text-sm font-medium", message.type === "error" ? "text-crit" : "text-good")}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
