import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronUp,
  Flame,
  Focus,
  Highlighter,
  Lock,
  Megaphone,
  Minus,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

/**
 * The icon set. Lucide, one family, one stroke weight, one size scale.
 *
 * This module exists so no component reaches for an emoji. Emoji are
 * font-dependent, render differently on every platform, can't take a design
 * token, and have no accessible name — 🔒 is a picture of a padlock, not a
 * lock control. Both design skills forbid them as structural icons, and this
 * codebase used to break that rule in eight places.
 */

/** Size tokens. Never pass an arbitrary pixel value. */
export const ICON = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 } as const;

/** One stroke weight across the whole app. */
const STROKE = 1.75;

export type IconProps = {
  size?: number;
  className?: string;
  /** Set only when the icon is the sole content of a control. */
  label?: string;
};

function make(Glyph: typeof Check) {
  return function Icon({ size = ICON.md, className, label }: IconProps) {
    return (
      <Glyph
        size={size}
        strokeWidth={STROKE}
        className={className}
        // Decorative unless it carries meaning no adjacent text repeats.
        aria-hidden={label ? undefined : true}
        aria-label={label}
        role={label ? "img" : undefined}
        focusable="false"
      />
    );
  };
}

export const IconCheck = make(Check);
export const IconLock = make(Lock);
export const IconFlame = make(Flame);
export const IconStar = make(Star);
export const IconUpvote = make(ChevronUp);
export const IconTrash = make(Trash2);
export const IconPlus = make(Plus);
export const IconMinus = make(Minus);
export const IconClose = make(X);
export const IconUpload = make(Upload);
export const IconArrow = make(ArrowRight);
export const IconBack = make(ArrowLeft);
export const IconHighlighter = make(Highlighter);
export const IconFocus = make(Focus);
export const IconMegaphone = make(Megaphone);

/** Filled star for the vaulted state — fill is the state, not a second icon. */
export function IconStarFilled({ size = ICON.md, className, label }: IconProps) {
  return (
    <Star
      size={size}
      strokeWidth={STROKE}
      fill="currentColor"
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
    />
  );
}
