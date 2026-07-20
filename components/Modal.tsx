"use client";

import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  // Escape to dismiss, and don't let the page scroll behind the overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-950/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-fade-up relative w-full max-w-sm rounded-xl border border-ink-800 bg-ink-900 p-5 shadow-2xl"
      >
        <h2 className="text-base font-semibold text-ink-100">{title}</h2>
        {description && (
          <p className="mt-1 mb-4 text-xs leading-relaxed text-ink-500">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
