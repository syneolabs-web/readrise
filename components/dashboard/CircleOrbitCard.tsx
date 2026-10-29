import Link from "next/link";
import { Avatar } from "@/components/ui";
import { IconUsers, IconArrow } from "@/components/icons";

type CircleMembership = {
  id: string;
  circle: {
    name: string;
    slug: string;
    memberships: { user: { id: string; name: string; avatarColor: string } }[];
    documents: unknown[];
  };
};

type Props = {
  memberships: CircleMembership[];
};

export function CircleOrbitCard({ memberships }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-ink-800/70 pb-2.5">
        <div className="flex items-center gap-2">
          <IconUsers size={15} className="text-accent" />
          <h3 className="cover-label text-2xs font-bold uppercase tracking-wider text-ink-400">
            Your Circles
          </h3>
        </div>
        <span className="text-3xs text-ink-500 font-semibold">
          {memberships.length} {memberships.length === 1 ? "circle" : "circles"}
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        {memberships.map((m) => (
          <Link
            key={m.id}
            href={`/circles/${m.circle.slug}`} prefetch={false}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-ink-800/70 bg-ink-950/40 p-2.5 transition-all duration-150 hover:border-ink-600 hover:bg-ink-850/60"
          >
            <div className="min-w-0">
              <span className="cover-label block truncate text-xs font-bold text-ink-100 group-hover:text-accent transition-colors">
                {m.circle.name}
              </span>
              <div className="mt-0.5 flex items-center gap-1.5 text-3xs text-ink-500">
                <span>{m.circle.memberships.length} {m.circle.memberships.length === 1 ? "member" : "members"}</span>
                <span>·</span>
                <span>{m.circle.documents.length} {m.circle.documents.length === 1 ? "book" : "books"}</span>
              </div>
            </div>

            <div className="flex shrink-0 -space-x-1.5">
              {m.circle.memberships.slice(0, 3).map((x) => (
                <Avatar
                  key={x.user.id}
                  name={x.user.name}
                  color={x.user.avatarColor}
                  size={20}
                  className="ring-2 ring-ink-950"
                />
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-3 border-t border-ink-800/70 pt-2.5 text-center">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-ink-100 transition-colors"
        >
          <span>Find more public circles</span>
          <IconArrow size={11} />
        </Link>
      </div>
    </div>
  );
}
