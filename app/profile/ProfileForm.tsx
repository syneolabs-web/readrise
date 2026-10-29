"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import { Field, errorFrom } from "@/components/AuthShell";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { IconCheck, IconSparkles, IconLock, IconUsers } from "@/components/icons";
import { Moon, Sun } from "lucide-react";

/** Initials colours. User content (how friends see you) */
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

const VIBES = [
  { id: "ember", label: "Orange Ember", swatch: "bg-series-orange", border: "border-series-orange" },
  { id: "tide", label: "Blue Tide", swatch: "bg-series-blue", border: "border-series-blue" },
  { id: "bloom", label: "Cerise Bloom", swatch: "bg-series-cerise", border: "border-series-cerise" },
  { id: "meadow", label: "Green Meadow", swatch: "bg-series-green", border: "border-series-green" },
] as const;

type Vibe = (typeof VIBES)[number]["id"];
type Theme = "dark" | "light";

export function ProfileForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || COLORS[0]!.value);
  const [avatarImage, setAvatarImage] = useState<string | null>(user.avatarImage || null);

  // Theme & Vibe state
  const [theme, setTheme] = useState<Theme>("dark");
  const [vibe, setVibe] = useState<Vibe>("ember");

  useEffect(() => {
    const d = document.documentElement;
    setTheme(d.dataset.theme === "light" ? "light" : "dark");
    const v = d.dataset.vibe as Vibe;
    if (VIBES.some((x) => x.id === v)) setVibe(v);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    const d = document.documentElement;
    d.dataset.theme = newTheme;
    d.classList.toggle("dark", newTheme !== "light");
    localStorage.setItem("pdx-theme", newTheme);
  };

  const handleVibeChange = (newVibe: Vibe) => {
    setVibe(newVibe);
    const d = document.documentElement;
    d.dataset.vibe = newVibe;
    localStorage.setItem("pdx-vibe", newVibe);
  };

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
      avatarImage,
    };

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await errorFrom(res, "Couldn't save your profile. Try again."));
      setMessage({ type: "success", text: "Profile and preferences updated successfully." });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't save changes." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Identity Details */}
      <div className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-4 sm:p-5 shadow-xs">
        <h4 className="cover-label text-xs font-bold uppercase tracking-wider text-ink-300">
          Personal Details
        </h4>
        <p className="mt-0.5 text-3xs text-ink-500">
          Your public name and account sign-in email
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Name"
            id="name"
            type="text"
            defaultValue={user.name}
            required
            maxLength={40}
            autoComplete="name"
          />
          <Field
            label="Email"
            id="email"
            type="email"
            defaultValue={user.email}
            required
            autoComplete="email"
          />
        </div>
      </div>

      {/* 2. Avatar Selection */}
      <div className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="cover-label text-xs font-bold uppercase tracking-wider text-ink-300">
              How Friends See You
            </h4>
            <p className="mt-0.5 text-3xs text-ink-500">
              Select an illustrated avatar or use your custom colored initials
            </p>
          </div>
          <span className="text-3xs font-semibold text-accent">
            {avatarImage === null ? "Initials Active" : "Illustrated"}
          </span>
        </div>

        <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-3 pt-1">
          {/* Option 0: Initials */}
          <button
            type="button"
            role="radio"
            aria-checked={avatarImage === null}
            aria-label="Use my initials"
            onClick={() => setAvatarImage(null)}
            className={cn(
              "relative grid h-14 w-14 shrink-0 snap-start place-items-center rounded-2xl text-base font-bold text-white transition-all duration-150 active:scale-95 cursor-pointer",
              avatarImage === null
                ? "ring-2 ring-accent ring-offset-2 ring-offset-ink-950 shadow-md scale-105"
                : "opacity-75 hover:opacity-100 hover:scale-102"
            )}
            style={{ backgroundColor: avatarColor }}
          >
            {initials(user.name)}
            {avatarImage === null && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white shadow-xs">
                <IconCheck size={9} />
              </span>
            )}
          </button>

          {/* 10 Illustrated Avatars */}
          {AVATARS.map((img, i) => {
            const isSelected = avatarImage === img;
            return (
              <button
                key={img}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Illustrated avatar ${i + 1}`}
                onClick={() => setAvatarImage(img)}
                className={cn(
                  "relative h-14 w-14 shrink-0 snap-start rounded-2xl transition-all duration-150 active:scale-95 cursor-pointer overflow-hidden",
                  isSelected
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-ink-950 shadow-md scale-105"
                    : "opacity-75 hover:opacity-100 hover:scale-102"
                )}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
                {isSelected && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white shadow-xs">
                    <IconCheck size={9} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Initials Colour Palette */}
        {avatarImage === null && (
          <div className="mt-4 border-t border-ink-800/60 pt-3.5">
            <p className="text-3xs font-semibold text-ink-400">
              Choose Initials Colour
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
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
                    "h-7 w-7 rounded-full transition-all duration-150 active:scale-95 cursor-pointer",
                    avatarColor === c.value
                      ? "ring-2 ring-ink-100 ring-offset-2 ring-offset-ink-950 scale-110"
                      : "opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Reading Appearance & Series Vibe */}
      <div className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-4 sm:p-5 shadow-xs">
        <div>
          <h4 className="cover-label text-xs font-bold uppercase tracking-wider text-ink-300">
            Reading Aesthetic & Series Vibe
          </h4>
          <p className="mt-0.5 text-3xs text-ink-500">
            Customise your reading interface, accent colours, and ambient theme
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Theme Mode */}
          <div>
            <label className="cover-label text-3xs font-bold uppercase text-ink-400">
              Appearance Mode
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer",
                  theme === "dark"
                    ? "border-accent bg-accent/10 text-ink-100 ring-1 ring-accent"
                    : "border-ink-800 bg-ink-900 text-ink-400 hover:text-ink-200"
                )}
              >
                <Moon size={14} />
                <span>Night Reading</span>
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer",
                  theme === "light"
                    ? "border-accent bg-accent/10 text-ink-100 ring-1 ring-accent"
                    : "border-ink-800 bg-ink-900 text-ink-400 hover:text-ink-200"
                )}
              >
                <Sun size={14} />
                <span>Day Paper</span>
              </button>
            </div>
          </div>

          {/* Series Vibe */}
          <div>
            <label className="cover-label text-3xs font-bold uppercase text-ink-400">
              Series Accent Palette
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {VIBES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleVibeChange(v.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold transition-all cursor-pointer",
                    vibe === v.id
                      ? "border-ink-100 bg-ink-850 text-ink-100 ring-1 ring-ink-100"
                      : "border-ink-800 bg-ink-900 text-ink-400 hover:text-ink-200"
                  )}
                >
                  <span className={`h-3.5 w-3.5 rounded-full ${v.swatch} shrink-0`} />
                  <span className="truncate text-3xs">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Security */}
      <div className="rounded-2xl border border-ink-800/70 bg-ink-950/40 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <IconLock size={14} className="text-ink-400" />
          <h4 className="cover-label text-xs font-bold uppercase tracking-wider text-ink-300">
            Security & Password
          </h4>
        </div>
        <p className="mt-0.5 text-3xs text-ink-500">
          Leave blank if you do not wish to change your existing password
        </p>

        <div className="mt-3.5 max-w-md">
          <Field
            label="New password"
            id="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </div>
      </div>

      {/* 5. Submit Action */}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="cover-label inline-flex items-center justify-center gap-2 rounded-full bg-series px-7 py-3 text-sm font-bold text-series-ink shadow-md transition-all duration-200 hover:scale-[1.01] hover:brightness-105 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
        >
          {isSubmitting && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-series-ink/30 border-t-series-ink" />
          )}
          <span>{isSubmitting ? "Saving Preferences…" : "Save Changes"}</span>
        </button>

        {message && (
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={cn(
              "rounded-xl px-3.5 py-2 text-xs font-medium border",
              message.type === "error"
                ? "border-crit/30 bg-crit/10 text-crit"
                : "border-good/30 bg-good/10 text-good"
            )}
          >
            {message.text}
          </div>
        )}
      </div>
    </form>
  );
}
