import { Avatar } from "@/components/ui";

/**
 * Where everyone in the circle is in one book, on a single printed rail.
 * The viewer is the ringed mark and the series-colour fill runs up to them;
 * friends sit where they are. Shown, never narrated — and never ranked.
 */
export function FriendsRail({
  members,
  progress,
  pageCount,
  viewerId,
  className = "",
}: {
  members: { id: string; name: string; avatarColor: string }[];
  progress: { userId: string; currentPage: number }[];
  pageCount: number;
  viewerId: string;
  className?: string;
}) {
  if (!pageCount) return null;
  const at = (id: string) => progress.find((p) => p.userId === id)?.currentPage ?? 1;
  const pos = (page: number) =>
    `${Math.min(100, Math.max(0, ((page - 1) / Math.max(1, pageCount - 1)) * 100))}%`;
  const mine = at(viewerId);

  return (
    <div className={className}>
      <div
        className="relative h-7"
        role="img"
        aria-label={members
          .map((m) => `${m.id === viewerId ? "You" : m.name}: page ${at(m.id)} of ${pageCount}`)
          .join(", ")}
      >
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-ink-800" />
        <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-series" style={{ width: pos(mine) }} />
        {members.map((m) => {
          const me = m.id === viewerId;
          return (
            <span
              key={m.id}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: pos(at(m.id)), zIndex: me ? 2 : 1 }}
              title={`${me ? "You" : m.name} — page ${at(m.id)} of ${pageCount}`}
            >
              <Avatar
                name={m.name}
                color={m.avatarColor}
                size={me ? 26 : 22}
                className={me ? "ring-2 ring-ink-100 ring-offset-2 ring-offset-ink-950" : "ring-2 ring-ink-950"}
              />
            </span>
          );
        })}
      </div>
      <div className="fig mt-1.5 flex justify-between text-2xs text-ink-500" aria-hidden="true">
        <span>p1</span>
        <span>p{pageCount}</span>
      </div>
    </div>
  );
}
