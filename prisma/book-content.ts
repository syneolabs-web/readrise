import { BODY_SIZE, wrap, type PdfLine } from "../scripts/pdf-builder";

/**
 * Original prose written for the seed. A fictional book so the demo circle has
 * something real to read, highlight, and argue about on first load.
 */

const p = (text: string): PdfLine[] =>
  wrap(text, BODY_SIZE).map((t) => ({ text: t }));
const h = (text: string): PdfLine[] => [{ text, heading: true }, { text: "" }];
const gap: PdfLine[] = [{ text: "" }];

export const BOOK_TITLE = "The Compound Self";
export const BOOK_AUTHOR = "R. Ellery Vance";

export const BOOK_PAGES: PdfLine[][] = [
  // ── Page 1 ────────────────────────────────────────────────
  [
    ...h("The Compound Self"),
    ...p("R. Ellery Vance"),
    ...gap,
    ...gap,
    ...h("Chapter One: Identity Before Outcomes"),
    ...p(
      "Most people set goals and then wonder why the goals do not set them. They decide to run a marathon, or write a book, or wake at five, and they treat the decision as though it were the work. It is not the work. It is a wish wearing the costume of a plan."
    ),
    ...gap,
    ...p(
      "The trouble with outcome goals is that they are borrowed. You can want a marathon medal without ever becoming the sort of person who runs. The medal sits outside you. It makes no claim on your Tuesday morning. And so, on the Tuesday morning when it is raining and your bed is warm, the medal has no vote."
    ),
    ...gap,
    ...p(
      "Identity is different. Identity does have a vote, and it votes every day, quietly, in the small moments where nobody is watching and no medal is on offer."
    ),
  ],

  // ── Page 2 ────────────────────────────────────────────────
  [
    ...p(
      "Consider two people who both want to quit smoking. Offered a cigarette, the first says: no thanks, I am trying to quit. The second says: no thanks, I am not a smoker. These sound like the same sentence. They are not remotely the same sentence."
    ),
    ...gap,
    ...p(
      "The first person still identifies as a smoker who is currently, effortfully, resisting. Every refusal costs them something. They are running a deficit, and deficits eventually get paid."
    ),
    ...gap,
    ...p(
      "The second has already moved. For them, refusing costs nothing, because there is nothing to refuse. You do not white-knuckle your way past foods you dislike. The behavior is not being suppressed; it is simply absent."
    ),
    ...gap,
    ...p(
      "This is the whole trick, and it is not a trick at all. Every action you take is a vote for the type of person you believe you are. No single vote will transform you. But the tally is always running, and it is always honest."
    ),
    ...gap,
    ...p(
      "So the question is never what do I want to achieve. The question is who do I wish to become, and what would that person do in the next ten minutes."
    ),
  ],

  // ── Page 3 ────────────────────────────────────────────────
  [
    ...h("Chapter Two: The Two-Minute Door"),
    ...p(
      "Ambition is a poor architect. Left alone, it designs cathedrals and lays no bricks. The most reliable way to sabotage a new habit is to begin it at the scale you imagine it should eventually reach."
    ),
    ...gap,
    ...p(
      "You do not need to meditate for an hour. You need to sit down. You do not need to write a chapter. You need to open the document. The goal of the first week is not progress. The goal of the first week is attendance."
    ),
    ...gap,
    ...p(
      "I call this the two-minute door. Any habit worth having has a door, and the door is almost always smaller than the room behind it. Read one page. Put on the running shoes. Write one sentence you are allowed to delete."
    ),
    ...gap,
    ...p(
      "The objection arrives immediately: but one page is nothing. One page will not make me well-read. This objection is correct and completely beside the point. You are not trying to get results yet. You are trying to become someone who shows up, because a person who shows up can be scaled and a person who does not cannot."
    ),
  ],

  // ── Page 4 ────────────────────────────────────────────────
  [
    ...p(
      "There is a second reason the door must be small, and it is less obvious. A large commitment is a negotiation. Every evening, an hour of reading must argue its case against sleep, against a screen, against the day you actually had rather than the day you planned."
    ),
    ...gap,
    ...p(
      "A two-minute commitment does not negotiate. It is beneath the threshold at which your mind bothers to object. It slips under the door precisely because it is small enough to fit."
    ),
    ...gap,
    ...p(
      "And here is what nobody tells you: you will almost never stop at two minutes. Starting is the expensive part. Once you are seated, once the shoes are on, continuing is nearly free. The door is small; the room is enormous. But you must go through the door, and you must go through it on the bad days, because the bad days are the only days that are actually deciding anything."
    ),
    ...gap,
    ...p(
      "Never miss twice. One missed day is an accident. Two is the beginning of a new identity, and it is not the one you wanted."
    ),
  ],

  // ── Page 5 ────────────────────────────────────────────────
  [
    ...h("Chapter Three: Friction Is a Design Choice"),
    ...p(
      "We like to believe our behavior is chosen. Mostly it is arranged. Put the fruit at eye level and you eat fruit. Put the phone in another room and you read. Not because you grew disciplined overnight, but because the path of least resistance moved, and you followed it, as you always do."
    ),
    ...gap,
    ...p(
      "This is unflattering, and it is good news. If willpower were the mechanism, you would be stuck with however much of it you were issued at birth. But if arrangement is the mechanism, then you are not fighting yourself. You are redesigning the room."
    ),
    ...gap,
    ...p(
      "Every habit you want should be made twenty seconds easier. Every habit you do not want should be made twenty seconds harder. That is the entire intervention. It sounds too small to matter. It is not too small to matter; it is exactly the size that matters, because twenty seconds is roughly the distance between an impulse and a decision."
    ),
  ],

  // ── Page 6 ────────────────────────────────────────────────
  [
    ...p(
      "The final piece is other people, and it is the piece most self-help quietly omits, because it cannot be sold to you alone."
    ),
    ...gap,
    ...p(
      "You will not out-discipline your environment, and the loudest part of your environment is the people in it. We do not adopt habits we admire. We adopt habits we witness. Proximity beats aspiration, every time, without exception, and usually without our noticing."
    ),
    ...gap,
    ...p(
      "So choose your witnesses deliberately. Not a crowd, and not an audience. Two or three people who will notice, specifically, whether you did the thing you said you would do, and who will ask about it in a way you cannot deflect."
    ),
    ...gap,
    ...p(
      "A promise made to yourself is a promise made in a room with no witnesses and no cost. A promise made to someone who will remember it on Friday is a different kind of object entirely. It has weight. It can be dropped, and dropping it makes a sound."
    ),
    ...gap,
    ...p(
      "Read together. Commit out loud. Check on each other. The compounding is real, but it compounds fastest where someone is watching with affection and paying attention."
    ),
  ],
];

export const MILESTONES = [
  { title: "Ch. 1 — Identity Before Outcomes", startPage: 1, endPage: 2, order: 0 },
  { title: "Ch. 2 — The Two-Minute Door", startPage: 3, endPage: 4, order: 1 },
  { title: "Ch. 3 — Friction Is a Design Choice", startPage: 5, endPage: 6, order: 2 },
];
