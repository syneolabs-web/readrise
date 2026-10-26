import Link from "next/link";
import { Avatar } from "@/components/ui";
import {
  IconHighlighter,
  IconMessage,
  IconStarFilled,
  IconCheckCircle,
  IconActivity,
  IconArrow,
} from "@/components/icons";
import { relativeTime } from "@/lib/utils";

type ActivityItem = {
  id: string;
  kind: "highlight" | "reply" | "vault" | "commit" | "checkin";
  at: string;
  actor: { id: string; name: string; avatarColor: string };
  circle: { name: string; slug: string };
  summary: string;
  href: string;
};

type Notification = {
  id: string;
  at: string;
  actor: { name: string; avatarColor: string };
  text: string;
  href: string;
};

type Props = {
  activity: ActivityItem[];
  notifications: Notification[];
};

export function ActivityFeedTimeline({ activity, notifications }: Props) {
  const getKindConfig = (kind: string) => {
    switch (kind) {
      case "highlight":
        return { icon: IconHighlighter, tag: "Highlight" };
      case "reply":
        return { icon: IconMessage, tag: "Margin Note" };
      case "vault":
        return { icon: IconStarFilled, tag: "Vault" };
      case "commit":
      case "checkin":
        return { icon: IconCheckCircle, tag: "Habit" };
      default:
        return { icon: IconActivity, tag: "Activity" };
    }
  };

  return (
    <div className="space-y-4">
      {/* Addressed To You (Direct replies on highlights) */}
      {notifications.length > 0 && (
        <div className="rounded-3xl border border-accent/30 bg-accent/[0.04] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-ink-800/40 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <h3 className="cover-label text-2xs font-bold uppercase tracking-wider text-accent">
                Addressed To You
              </h3>
            </div>
            <span className="text-3xs text-ink-500">
              Direct replies on your notes
            </span>
          </div>

          <div className="mt-1 divide-y divide-ink-800/40">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                className="group flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-ink-850/40 px-2 rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={n.actor.name} color={n.actor.avatarColor} size={26} />
                  <div className="min-w-0">
                    <p className="text-xs text-ink-300">
                      <span className="font-bold text-ink-100">{n.actor.name}</span>{" "}
                      <span className="group-hover:text-ink-100 transition-colors">{n.text}</span>
                    </p>
                    <span className="text-3xs text-ink-500">{relativeTime(n.at)}</span>
                  </div>
                </div>
                <IconArrow size={13} className="text-ink-500 group-hover:text-accent transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Circle Activity Stream */}
      <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-ink-800/70 pb-2.5">
          <div>
            <h3 className="cover-label text-sm font-bold text-ink-100 sm:text-base">
              Circle Activity Stream
            </h3>
            <p className="text-xs text-ink-400">
              Real-time margin reflections and reading progress
            </p>
          </div>

          <span className="text-3xs font-semibold text-ink-500">
            {activity.length} {activity.length === 1 ? "event" : "events"}
          </span>
        </div>

        {activity.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink-800 p-6 text-center bg-ink-950/40">
            <p className="text-xs font-semibold text-ink-300">Quiet across your circles tonight</p>
            <p className="mt-1 text-3xs text-ink-500">
              Open a book and mark a sentence in the margin to get the conversation moving.
            </p>
          </div>
        ) : (
          <div className="mt-2 divide-y divide-ink-800/50">
            {activity.map((a) => {
              const cfg = getKindConfig(a.kind);
              const Icon = cfg.icon;

              return (
                <Link
                  key={a.id}
                  href={a.href}
                  className="group flex items-start gap-3 py-3 transition-all duration-150 hover:bg-ink-850/50 -mx-1.5 px-2 rounded-xl"
                >
                  <Avatar name={a.actor.name} color={a.actor.avatarColor} size={28} className="mt-0.5" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink-100">
                          {a.actor.name}
                        </span>
                        <span className="rounded-full bg-ink-850 px-2 py-0.5 text-3xs font-medium text-ink-400">
                          {a.circle.name}
                        </span>
                      </div>
                      <span className="text-3xs text-ink-500 shrink-0">
                        {relativeTime(a.at)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-ink-300 group-hover:text-ink-100 transition-colors leading-relaxed">
                      {a.summary}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5 text-3xs text-ink-500">
                      <Icon size={12} className="text-accent" />
                      <span>{cfg.tag}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
