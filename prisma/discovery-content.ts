import { BODY_SIZE, wrap, type PdfLine } from "../scripts/pdf-builder";

/**
 * Lightweight books + public circles for the discovery experience.
 *
 * Short but real: each book gets a title page and a couple of pages of themed
 * prose so it renders in the reader and can be highlighted. The circles are
 * public (isPublic) so they surface in Global Pulse and can be joined without
 * a code. Original prose, fictional attributions.
 */

const p = (text: string): PdfLine[] =>
  wrap(text, BODY_SIZE).map((t) => ({ text: t }));
const h = (text: string): PdfLine[] => [{ text, heading: true }, { text: "" }];
const gap: PdfLine[] = [{ text: "" }];

function book(title: string, author: string, chapters: [string, string][]): PdfLine[][] {
  const pages: PdfLine[][] = [
    [...h(title), ...p(author), ...gap, ...gap],
  ];
  for (const [heading, body] of chapters) {
    const page: PdfLine[] = [...h(heading)];
    for (const para of body.split("\n\n")) {
      page.push(...p(para), ...gap);
    }
    pages.push(page);
  }
  return pages;
}

export type DiscoveryBook = {
  title: string;
  author: string;
  pages: PdfLine[][];
};

export type DiscoveryCircle = {
  name: string;
  slug: string;
  tagline: string;
  inviteCode: string;
  book: DiscoveryBook;
  /** How many members to fabricate beyond the seeded three. */
  extraMembers: number;
};

export const DISCOVERY_CIRCLES: DiscoveryCircle[] = [
  {
    name: "Modern Stoicism",
    slug: "modern-stoicism",
    tagline: "Reading the Stoics for a calmer, more deliberate life.",
    inviteCode: "STOIC01",
    extraMembers: 4,
    book: {
      title: "The Deliberate Mind",
      author: "Aurelia Vance",
      pages: book("The Deliberate Mind", "Aurelia Vance", [
        [
          "Chapter One: What Is Up To You",
          "The Stoics drew one line and built everything on it: some things are up to you, and some are not. Your judgements, your effort, your response — yours. The weather, the traffic, other people's opinions of you — not yours.\n\nMost unhappiness is the tax you pay for wanting what was never up to you. Move the wanting inside the line, and the tax disappears. Not because the world got kinder, but because you stopped billing yourself for its indifference.",
        ],
        [
          "Chapter Two: The View From Above",
          "When a worry grows too large, the Stoics zoomed out. See the city from the hill, the country from the sky, the planet from the dark. Your problem is still real, but it is now the right size.\n\nThis is not a trick to feel small. It is a way to feel accurate. Scale restores proportion, and proportion is most of wisdom.",
        ],
      ]),
    },
  },
  {
    name: "Atomic Habits Club",
    slug: "atomic-habits-club",
    tagline: "Small changes, compounded. One habit at a time, together.",
    inviteCode: "ATOMIC1",
    extraMembers: 6,
    book: {
      title: "One Percent",
      author: "Jonah Reece",
      pages: book("One Percent", "Jonah Reece", [
        [
          "Chapter One: The Plateau of Latent Potential",
          "Habits are the compound interest of self-improvement. One percent better each day is not visible tomorrow, and barely visible next month. Then, somewhere past the point most people quit, the line bends.\n\nThe work was never wasted during the flat part. It was being stored. Disappointment is what happens when you expect linear returns from a compounding process.",
        ],
        [
          "Chapter Two: Make It Obvious",
          "You do not rise to the level of your goals; you fall to the level of your systems. And a system begins with a cue. Put the book on the pillow. Lay the shoes by the door. Design the environment so the good choice is the obvious one.\n\nDiscipline is overrated because it is really just a well-arranged room wearing a costume.",
        ],
      ]),
    },
  },
  {
    name: "The Alchemist Circle",
    slug: "the-alchemist-circle",
    tagline: "A slow, shared read of a story about following your calling.",
    inviteCode: "ALCHM01",
    extraMembers: 3,
    book: {
      title: "Signs Along the Way",
      author: "Marco Della Sera",
      pages: book("Signs Along the Way", "Marco Della Sera", [
        [
          "Chapter One: The Shepherd's Dream",
          "A boy dreams the same dream twice and decides it must mean something. This is the whole beginning of every worthwhile journey: not certainty, but a willingness to treat a recurring pull as a message rather than noise.\n\nThe world speaks in repetition. What returns to you unbidden is worth following.",
        ],
        [
          "Chapter Two: Beginner's Luck",
          "When you want something, the beginning is suspiciously easy. The Stoics would call it fortune; the boy calls it a sign. Either way, the early ease is a loan, and the middle of the journey is where it is repaid.\n\nDo not mistake the loan for a promise. Mistake it for an invitation.",
        ],
      ]),
    },
  },
];

/** Fabricated members for populating public circles. */
export const EXTRA_PEOPLE = [
  { name: "Ravi", color: "#f59e0b" },
  { name: "Sofia", color: "#8b5cf6" },
  { name: "Kenji", color: "#ef4444" },
  { name: "Amara", color: "#10b981" },
  { name: "Leo", color: "#3b82f6" },
  { name: "Nadia", color: "#ec4899" },
  { name: "Tomas", color: "#14b8a6" },
];
