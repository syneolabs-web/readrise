"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import type { Notification } from "@/lib/activity";
import { Avatar } from "./ui";
import { relativeTime } from "@/lib/utils";

/**
 * Notifications: things addressed to the viewer (replies to their highlights,
 * their highlights being saved). Narrow by design — not a firehose. A dot
 * marks unseen items; opening the panel clears it (per-device, localStorage).
 */
export function NotificationBell({ items }: { items: Notification[] }) {
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLastSeen(localStorage.getItem("pdx-notif-seen") ?? "");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const newest = items[0]?.at ?? "";
  const unseen = newest && newest > lastSeen;

  function toggle() {
    setOpen((o) => {
      if (!o && newest) {
        localStorage.setItem("pdx-notif-seen", newest);
        setLastSeen(newest);
      }
      return !o;
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        aria-label={`Notifications${unseen ? " (new)" : ""}`}
        aria-expanded={open}
        className="relative grid h-7 w-7 place-items-center rounded-md text-ink-400 transition-colors duration-[120ms] hover:bg-ink-800 hover:text-ink-100"
      >
        <Bell size={15} strokeWidth={1.75} aria-hidden="true" />
        {unseen && (
          <span
            className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent"
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div className="animate-fade-up absolute right-0 top-9 z-50 w-80 overflow-hidden rounded-lg border border-ink-800 bg-ink-900 shadow-2xl shadow-black/40">
          <div className="border-b border-ink-800 px-4 py-2.5">
            <p className="plate-label">
              Notifications
            </p>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-ink-600">
              Nothing yet. When someone replies to your highlights, it shows up
              here.
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-2.5 px-4 py-2.5 transition-colors hover:bg-ink-850"
                  >
                    <Avatar
                      name={n.actor.name}
                      color={n.actor.avatarColor}
                      size={22}
                      className="mt-0.5"
                    />
                    <div className="min-w-0">
                      <p className="text-xs leading-snug text-ink-200">
                        <span className="font-medium text-ink-100">
                          {n.actor.name}
                        </span>{" "}
                        {n.text}
                      </p>
                      <p className="mt-0.5 text-2xs text-ink-600">
                        {relativeTime(n.at)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
