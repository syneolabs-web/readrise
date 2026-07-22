"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The signature element.
 *
 * The landing page IS a page you can annotate. Select any sentence in the
 * manifesto and it highlights, and the margin note that belongs to it appears
 * beside it — written by one of the seeded circle members.
 *
 * The argument for doing it this way: every other reading product explains its
 * core gesture with a screenshot. Here the hero is the product. You learn the
 * one thing Prodoxity does by doing it, in about five seconds, before you've
 * signed up — and the page demonstrates its own thesis (the social gesture is
 * aimed at a paragraph, not at a feed).
 */

type Passage = {
  id: string;
  text: string;
  note: { author: string; color: string; body: string };
};

const PASSAGES: Passage[] = [
  {
    id: "p1",
    text: "The books that change you are rarely read alone. Somewhere in the margin, someone saw the thing you missed.",
    note: {
      author: "Maya",
      color: "#ec4899",
      body: "I've reread this chapter three times solo. Pratik's one comment did more than all three.",
    },
  },
  {
    id: "p2",
    text: "A circle is small on purpose — two or three people who will actually notice whether you showed up.",
    note: {
      author: "Dev",
      color: "#14b8a6",
      body: "Small enough that you can't hide, warm enough that you don't want to.",
    },
  },
  {
    id: "p3",
    text: "You highlight a sentence. A friend replies. A week later it's a habit you both somehow kept.",
    note: {
      author: "Pratik",
      color: "#6366f1",
      body: "This is the whole loop. Reading goes in, a changed Tuesday comes out.",
    },
  },
  {
    id: "p4",
    text: "Chase a tangent. Talk about one paragraph for an hour. It all still lands on the page you're reading together.",
    note: {
      author: "Maya",
      color: "#ec4899",
      body: "You can absolutely lose two hours in here. You'll just be two hours deeper into the book.",
    },
  },
  {
    id: "p5",
    text: "This is what all that screen time could have been building the whole time.",
    note: {
      author: "Dev",
      color: "#14b8a6",
      body: "Same thumb, same hour, same phone. Different thing to show for it.",
    },
  },
];

export function Manifesto() {
  const [active, setActive] = useState<string | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const pageRef = useRef<HTMLDivElement>(null);

  // Reading a real selection rather than a click keeps the gesture honest:
  // this is the same interaction the reader uses, not a lookalike.
  const onSelect = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !pageRef.current) return;

    const node =
      sel.anchorNode instanceof HTMLElement
        ? sel.anchorNode
        : sel.anchorNode?.parentElement;
    const passage = node?.closest<HTMLElement>("[data-passage]");
    if (!passage || !pageRef.current.contains(passage)) return;

    const id = passage.dataset.passage!;
    setActive(id);
    setDiscovered((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  useEffect(() => {
    const handler = () => setTimeout(onSelect, 0); // let the selection settle
    document.addEventListener("mouseup", handler);
    document.addEventListener("touchend", handler);
    return () => {
      document.removeEventListener("mouseup", handler);
      document.removeEventListener("touchend", handler);
    };
  }, [onSelect]);

  const activePassage = PASSAGES.find((p) => p.id === active);

  return (
    <div className="relative">
      {/* The page. The only paper on the whole site — it's a material, not a
          background. */}
      <div
        ref={pageRef}
        className="relative rounded-sm bg-surface px-7 py-9 text-surface-ink shadow-2xl shadow-black/50 sm:px-12 sm:py-14"
      >
        <p className="mb-7 font-sans text-2xs font-semibold uppercase tracking-[0.18em] text-surface-ink/35">
          On why this exists
        </p>

        <div className="space-y-5 font-prose text-lg leading-[1.62] sm:text-xl">
          {PASSAGES.map((p) => {
            const isActive = active === p.id;
            const seen = discovered.has(p.id);
            return (
              <p
                key={p.id}
                data-passage={p.id}
                onClick={() => {
                  setActive(p.id);
                  setDiscovered((prev) => new Set(prev).add(p.id));
                }}
                className="cursor-text transition-colors duration-[120ms]"
                style={{
                  background: isActive
                    ? "rgba(240,180,41,0.42)"
                    : seen
                      ? "rgba(240,180,41,0.15)"
                      : undefined,
                  boxShadow: isActive
                    ? "0 0 0 3px rgba(240,180,41,0.42)"
                    : undefined,
                }}
              >
                {p.text}
              </p>
            );
          })}
        </div>

        {/* Instruction, set as a real marginal instruction rather than a badge. */}
        <p className="mt-9 border-t border-paper-ink/10 pt-4 font-sans text-xs text-surface-ink/40">
          Select any sentence — the way you would in a book.
        </p>
      </div>

      {/* The margin. On wide screens it's an actual margin; below that the note
          docks under the page rather than covering the text. */}
      <div
        aria-live="polite"
        className="mt-4 min-h-[7rem] lg:absolute lg:top-0 lg:-right-[19rem] lg:mt-0 lg:w-[17rem]"
      >
        {activePassage ? (
          <div
            key={activePassage.id}
            className="animate-fade-up rounded-md border border-ink-800 bg-ink-900 p-4"
          >
            <div className="flex items-center gap-2">
              <span
                className="grid h-5 w-5 place-items-center rounded-full text-2xs font-semibold text-on-accent"
                style={{ background: activePassage.note.color }}
                aria-hidden="true"
              >
                {activePassage.note.author[0]}
              </span>
              <span className="text-xs font-medium text-ink-300">
                {activePassage.note.author}
              </span>
              <span className="ml-auto text-2xs text-ink-600">in the margin</span>
            </div>
            <p className="mt-2.5 font-prose text-sm leading-relaxed text-ink-300">
              {activePassage.note.body}
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-ink-800 p-4">
            <p className="text-xs leading-relaxed text-ink-600">
              Your circle&apos;s notes appear here — anchored to the exact
              sentence, never to a feed.
            </p>
          </div>
        )}

        {discovered.size > 0 && (
          <p className="mt-3 font-sans text-2xs text-ink-700">
            {discovered.size} of {PASSAGES.length} read
          </p>
        )}
      </div>
    </div>
  );
}
