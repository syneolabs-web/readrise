"use client";

import { useEffect, useRef } from "react";

/**
 * The last element the user actually interacted with, tracked globally.
 *
 * Dialogs need to hand focus back to whatever opened them, but by the time a
 * mount effect runs the trigger has already blurred — so the honest moment to
 * record it is the interaction itself, in the capture phase, before React
 * re-renders anything. This is the same approach Radix and Reach take.
 *
 * `pointerdown` covers mouse and touch; `keydown` covers Enter/Space on a
 * focused control. One listener pair for the whole app, registered lazily.
 */
let lastInteractive: HTMLElement | null = null;

if (typeof document !== "undefined") {
  const remember = (e: Event) => {
    const el = e.target as HTMLElement | null;
    const focusable = el?.closest?.<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) lastInteractive = focusable;
  };
  document.addEventListener("pointerdown", remember, true);
  document.addEventListener("keydown", remember, true);
}

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
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

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

  /**
   * Focus goes into the dialog on open and back to the trigger on close.
   *
   * Without this, `aria-modal` claims the rest of the page is inert while
   * focus is still sitting behind the overlay — so a keyboard or screen-reader
   * user tabs through a page they cannot see. Returning focus afterwards is
   * the other half: losing your place to the top of the document on every
   * dismissal makes a dialog feel like a page navigation.
   */
  useEffect(() => {
    if (!open) return;

    // The trigger is captured at interaction time (see lastInteractive below),
    // not here. By the time this effect runs, React has re-rendered and the
    // button that opened the dialog has usually already blurred to <body> —
    // reading document.activeElement now returns nothing worth restoring to.
    // Effects also run twice under StrictMode, so a read here would capture
    // whatever the first pass focused: an input inside this very panel.
    restoreFocus.current = lastInteractive;

    // Prefer the first real control; fall back to the panel itself so focus
    // never stays behind the overlay.
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, select, button, [href], [tabindex]:not([tabindex="-1"])'
    );
    (focusable ?? panelRef.current)?.focus();

    return () => {
      const target = restoreFocus.current;
      // Deferred by a frame: on close React re-renders the trigger's subtree,
      // and calling focus() during cleanup can land on a node that is about to
      // be detached — focus then falls to <body> and the keyboard user loses
      // their place entirely. Waiting a frame lets the DOM settle.
      requestAnimationFrame(() => {
        if (target?.isConnected) target.focus();
      });
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-backdrop-in absolute inset-0 bg-ink-950/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="animate-modal-in relative w-full max-w-md rounded-3xl border border-ink-700/60 bg-ink-900/95 p-7 shadow-2xl backdrop-blur-2xl outline-none"
      >
        <h2 className="cover-title text-xl font-bold text-ink-100">{title}</h2>
        {description && (
          <p className="mt-1.5 mb-5 text-sm leading-relaxed text-ink-400">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
