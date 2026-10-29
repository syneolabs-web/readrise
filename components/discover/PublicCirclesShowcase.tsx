"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui";
import { BookCover } from "@/components/BookCover";
import { JoinButton } from "@/app/discover/JoinButton";
import { IconUsers, IconBookOpen, IconSparkles, IconPlus, IconArrow } from "@/components/icons";

type PublicCircle = {
  name: string;
  slug: string;
  tagline: string | null;
  inviteCode: string;
  memberCount: number;
  joined: boolean;
  avatars: { name: string; color: string }[];
  book: { title: string; author: string | null } | null;
};

type Props = {
  circles: PublicCircle[];
};

const TRACKS = [
  "All Volumes",
  "Mental Models & Philosophy",
  "Systems & Craft",
  "Leadership & Culture",
];

export function PublicCirclesShowcase({ circles }: Props) {
  const [activeTrack, setActiveTrack] = useState("All Volumes");

  return (
    <div className="space-y-4">
      {/* Track Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IconUsers size={16} className="text-accent" />
          <h2 className="cover-label text-sm sm:text-base font-bold text-ink-100">
            Open Circles You Can Join
          </h2>
        </div>

        {/* Tracks */}
        <div className="flex flex-wrap items-center gap-1.5">
          {TRACKS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTrack(t)}
              className={`rounded-full px-2.5 py-1 text-3xs font-semibold transition-all cursor-pointer ${
                activeTrack === t
                  ? "bg-ink-100 text-ink-950 shadow-xs"
                  : "bg-ink-900 border border-ink-800 text-ink-400 hover:text-ink-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Circle Content */}
      {circles.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl border border-ink-800/80 bg-ink-900 p-6 sm:p-8 shadow-sm">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/8 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <IconSparkles size={22} />
            </div>

            <h3 className="cover-title mt-4 text-xl sm:text-2xl font-bold text-ink-100">
              Be The First Pod To Open Your Margin Notes
            </h3>

            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-400">
              Every circle begins private. Gather 2–3 friends, bring any book in PDF, and read chapter by chapter. When your discussions are ready, vote unanimously to feature your insights here.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/circles"
                className="cover-label inline-flex items-center gap-2 rounded-full bg-series px-6 py-3 text-xs font-bold text-series-ink shadow-md hover:brightness-105 active:scale-95 transition-all"
              >
                <IconPlus size={13} />
                <span>Start a Private Circle</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {circles.map((c) => (
            <div
              key={c.slug}
              className="group relative flex flex-col justify-between rounded-3xl border border-ink-800/80 bg-ink-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-600 hover:bg-ink-850/60"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="cover-label truncate text-base font-bold text-ink-100 group-hover:text-accent transition-colors">
                      {c.name}
                    </h3>
                    {c.tagline && (
                      <p className="mt-1 line-clamp-2 text-xs text-ink-400 leading-relaxed font-prose italic">
                        &ldquo;{c.tagline}&rdquo;
                      </p>
                    )}
                  </div>

                  <JoinButton slug={c.slug} joined={c.joined} />
                </div>

                {/* Book Preview */}
                {c.book ? (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ink-800/60 bg-ink-950/40 p-3">
                    <BookCover title={c.book.title} author={c.book.author} width={44} />
                    <div className="min-w-0 flex-1">
                      <span className="cover-label block truncate text-xs font-bold text-ink-200">
                        {c.book.title}
                      </span>
                      <span className="block truncate text-3xs text-ink-500">
                        {c.book.author || "Currently reading"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-ink-800 bg-ink-950/30 p-3 text-3xs text-ink-500">
                    <IconBookOpen size={14} />
                    <span>Circle choosing next volume</span>
                  </div>
                )}
              </div>

              {/* Members Bottom Bar */}
              <div className="mt-4 flex items-center justify-between border-t border-ink-800/60 pt-3">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {c.avatars.map((a, i) => (
                      <Avatar
                        key={i}
                        name={a.name}
                        color={a.color}
                        size={20}
                        className="ring-2 ring-ink-900"
                      />
                    ))}
                  </div>
                  <span className="text-3xs font-semibold text-ink-400">
                    {c.memberCount} {c.memberCount === 1 ? "reader" : "readers"}
                  </span>
                </div>

                <Link
                  href={`/circles/${c.slug}`}
                  className="inline-flex items-center gap-1 text-3xs font-semibold text-accent hover:underline"
                >
                  <span>Explore room</span>
                  <IconArrow size={11} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
