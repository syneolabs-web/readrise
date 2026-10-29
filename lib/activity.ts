import { cache } from "react";
import { db } from "./db";
import { weekOf } from "./utils";

/**
 * Derived read-models for the social surfaces (dashboard, discovery,
 * notifications). Everything here is computed from the primary tables — there
 * is no separate activity/event store to keep in sync.
 *
 * Scope rule carried over from the private-circle era: activity is only ever
 * drawn from circles the viewer belongs to. Discovery is the one exception,
 * and it reads only PUBLIC circles.
 */

export type ActivityKind = "highlight" | "reply" | "vault" | "commit" | "checkin";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  at: string;
  actor: { id: string; name: string; avatarColor: string };
  circle: { name: string; slug: string };
  /** Human sentence fragment, e.g. 'highlighted in "The Compound Self"'. */
  summary: string;
  /** Where clicking goes. */
  href: string;
  documentId?: string;
};

/** Circle ids the user belongs to. Deduplicated per request lifecycle. */
export const myCircleIds = cache(async function myCircleIds(userId: string): Promise<string[]> {
  const rows = await db.membership.findMany({
    where: { userId },
    select: { circleId: true },
  });
  return rows.map((r) => r.circleId);
});

/**
 * The Circle Activity Feed: recent things people did across the viewer's
 * circles. Unified from highlights, replies, vault adds, and commitments.
 */
export async function getCircleActivity(
  userId: string,
  limit = 20
): Promise<ActivityItem[]> {
  const circleIds = await myCircleIds(userId);
  if (circleIds.length === 0) return [];

  const [highlights, comments, vault, actions] = await Promise.all([
    db.highlight.findMany({
      where: { document: { circleId: { in: circleIds } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatarColor: true } },
        document: { select: { id: true, title: true, circle: { select: { name: true, slug: true } } } },
      },
    }),
    db.comment.findMany({
      where: { highlight: { document: { circleId: { in: circleIds } } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatarColor: true } },
        highlight: {
          select: {
            documentId: true,
            document: { select: { title: true, circle: { select: { name: true, slug: true } } } },
          },
        },
      },
    }),
    db.vaultEntry.findMany({
      where: { circleId: { in: circleIds } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        addedBy: { select: { id: true, name: true, avatarColor: true } },
        circle: { select: { name: true, slug: true } },
      },
    }),
    db.microAction.findMany({
      where: { circleId: { in: circleIds } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        createdBy: { select: { id: true, name: true, avatarColor: true } },
        circle: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const items: ActivityItem[] = [];

  for (const h of highlights) {
    items.push({
      id: `h-${h.id}`,
      kind: "highlight",
      at: h.createdAt.toISOString(),
      actor: h.user,
      circle: h.document.circle,
      summary: `highlighted in “${h.document.title}”`,
      href: `/read/${h.document.id}`,
      documentId: h.document.id,
    });
  }
  for (const c of comments) {
    items.push({
      id: `c-${c.id}`,
      kind: "reply",
      at: c.createdAt.toISOString(),
      actor: c.user,
      circle: c.highlight.document.circle,
      summary: `replied in “${c.highlight.document.title}”`,
      href: `/read/${c.highlight.documentId}`,
      documentId: c.highlight.documentId,
    });
  }
  for (const v of vault) {
    items.push({
      id: `v-${v.id}`,
      kind: "vault",
      at: v.createdAt.toISOString(),
      actor: v.addedBy,
      circle: v.circle,
      summary: `saved an insight to the vault`,
      href: `/circles/${v.circle.slug}/vault`,
    });
  }
  for (const a of actions) {
    items.push({
      id: `a-${a.id}`,
      kind: "commit",
      at: a.createdAt.toISOString(),
      actor: a.createdBy,
      circle: a.circle,
      summary: `committed to “${a.title}”`,
      href: `/circles/${a.circle.slug}`,
    });
  }

  return items
    .sort((x, y) => (x.at < y.at ? 1 : -1))
    .slice(0, limit);
}

export type Notification = {
  id: string;
  at: string;
  actor: { name: string; avatarColor: string };
  text: string;
  href: string;
};

/**
 * Notifications: things that happened TO the viewer — replies on their
 * highlights, and their highlights being saved to a vault. Deliberately
 * narrow: not a firehose of everything, just what's addressed to you.
 * Deduplicated per request lifecycle via React.cache.
 */
export const getNotifications = cache(async function getNotifications(
  userId: string,
  limit = 15
): Promise<Notification[]> {
  const [replies, vaulted] = await Promise.all([
    db.comment.findMany({
      where: { highlight: { userId }, userId: { not: userId } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { name: true, avatarColor: true } },
        highlight: { select: { documentId: true, textContent: true } },
      },
    }),
    db.vaultEntry.findMany({
      where: { highlight: { userId }, addedById: { not: userId } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        addedBy: { select: { name: true, avatarColor: true } },
        highlight: { select: { documentId: true } },
        circle: { select: { slug: true } },
      },
    }),
  ]);

  const items: Notification[] = [];
  for (const c of replies) {
    items.push({
      id: `r-${c.id}`,
      at: c.createdAt.toISOString(),
      actor: c.user,
      text: "replied to your highlight",
      href: `/read/${c.highlight.documentId}`,
    });
  }
  for (const v of vaulted) {
    items.push({
      id: `vn-${v.id}`,
      at: v.createdAt.toISOString(),
      actor: v.addedBy,
      text: "saved your highlight to the vault",
      href: `/circles/${v.circle.slug}/vault`,
    });
  }

  return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
});

/** My Progress: the viewer's own accumulated numbers + a 7-day chart. Deduplicated via React.cache. */
export const getMyProgress = cache(async function getMyProgress(userId: string) {
  const circleIds = await myCircleIds(userId);

  // Only fetch highlights from the last 7 days for the chart rather than all-time history
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [vaultCount, recentHighlights, totalHighlightsCount, docs, actions] = await Promise.all([
    db.vaultEntry.count({ where: { addedById: userId } }),
    db.highlight.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    db.highlight.count({ where: { userId } }),
    db.readingProgress.count({ where: { userId } }),
    db.microAction.findMany({
      where: { circleId: { in: circleIds } },
      include: { checkins: { select: { userId: true } } },
    }),
  ]);

  // Streak: consecutive past weeks the viewer personally checked in.
  const thisWeek = weekOf();
  const myWeeks = new Set(
    actions
      .filter((a) => a.checkins.some((c) => c.userId === userId))
      .map((a) => a.weekOf)
  );
  let streak = 0;
  const cursor = new Date();
  // Count back week by week while the viewer checked in.
  for (let i = 0; i < 52; i++) {
    const wk = weekOf(cursor);
    if (wk === thisWeek && !myWeeks.has(wk)) {
      // This week not yet done — don't break the streak on it.
      cursor.setDate(cursor.getDate() - 7);
      continue;
    }
    if (myWeeks.has(wk)) {
      streak++;
      cursor.setDate(cursor.getDate() - 7);
    } else break;
  }

  // 7-day highlight activity, oldest→newest (Mon-anchored labels).
  const days: { label: string; count: number }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = recentHighlights.filter(
      (h) => h.createdAt >= d && h.createdAt < next
    ).length;
    days.push({ label: dayNames[d.getDay()]!, count });
  }

  return {
    streak,
    insights: vaultCount,
    highlights: totalHighlightsCount,
    books: docs,
    week: days,
  };
});

/** Global Pulse: public circles the viewer can discover + popular books. Deduplicated via React.cache. */
export const getDiscover = cache(async function getDiscover(userId: string) {
  const myIds = new Set(await myCircleIds(userId));

  const publicCircles = await db.circle.findMany({
    where: { isPublic: true },
    include: {
      memberships: { include: { user: { select: { name: true, avatarColor: true } } } },
      documents: {
        select: { id: true, title: true, author: true, _count: { select: { highlights: true } } },
      },
      _count: { select: { memberships: true } },
    },
  });

  const circles = publicCircles
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      tagline: c.tagline,
      inviteCode: c.inviteCode,
      memberCount: c._count.memberships,
      joined: myIds.has(c.id),
      avatars: c.memberships.slice(0, 5).map((m) => ({
        name: m.user.name,
        color: m.user.avatarColor,
      })),
      book: c.documents[0]
        ? { title: c.documents[0].title, author: c.documents[0].author }
        : null,
    }))
    // Most members first — a light "trending" proxy.
    .sort((a, b) => b.memberCount - a.memberCount);

  // Popular books across all public circles, by highlight count.
  const books = publicCircles
    .flatMap((c) =>
      c.documents.map((d) => ({
        id: d.id,
        title: d.title,
        author: d.author,
        highlights: d._count.highlights,
        circleSlug: c.slug,
        circleName: c.name,
      }))
    )
    .sort((a, b) => b.highlights - a.highlights)
    .slice(0, 5);

  return { circles, books };
});

/** Heatmap: the last 91 days of the viewer's activity (GitHub style). */
export async function getHeatmap(userId: string) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 91);
  cutoff.setHours(0, 0, 0, 0);

  const [highlights, vault, checkins] = await Promise.all([
    db.highlight.findMany({
      where: { userId, createdAt: { gte: cutoff } },
      select: { createdAt: true },
    }),
    db.vaultEntry.findMany({
      where: { addedById: userId, createdAt: { gte: cutoff } },
      select: { createdAt: true },
    }),
    db.actionCheckin.findMany({
      where: { userId, checkedAt: { gte: cutoff } },
      select: { checkedAt: true },
    }),
  ]);

  const activityMap = new Map<string, number>();

  const countActivity = (dates: { createdAt?: Date; checkedAt?: Date }[]) => {
    for (const item of dates) {
      // YYYY-MM-DD
      const dateVal = item.createdAt || item.checkedAt;
      if (dateVal) {
        const dateStr = dateVal.toISOString().split("T")[0];
        activityMap.set(dateStr!, (activityMap.get(dateStr!) || 0) + 1);
      }
    }
  };

  countActivity(highlights);
  countActivity(vault);
  countActivity(checkins);

  const days: { date: string; count: number; level: number }[] = [];
  
  // Generate flat list from oldest (91 days ago) to today
  for (let i = 90; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]!;
    const count = activityMap.get(dateStr) || 0;
    
    // Level 0: 0, Level 1: 1-2, Level 2: 3-5, Level 3: 6-9, Level 4: 10+
    let level = 0;
    if (count > 0) level = 1;
    if (count >= 3) level = 2;
    if (count >= 6) level = 3;
    if (count >= 10) level = 4;

    days.push({ date: dateStr, count, level });
  }

  return days;
}
