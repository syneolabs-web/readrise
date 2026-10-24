import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui";
import { AuthShell } from "@/components/AuthShell";

/**
 * The invite link: /join/ABCD1234
 *
 * Designed around the case that actually happens — you paste the link to a
 * friend who has never used Readrise. So it must survive being opened by a
 * logged-out stranger: it shows them WHICH circle they were invited to, then
 * hands off to sign-in carrying a `next` back to here, so the code isn't lost
 * in the round trip.
 *
 * Joining happens on this page rather than via the API because a link click
 * is already the user's intent — making them press a second button would be
 * ceremony.
 */
export default async function JoinByCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw).toUpperCase().trim();

  const circle = await db.circle.findUnique({
    where: { inviteCode: code },
    include: { _count: { select: { memberships: true, documents: true } } },
  });

  const user = await getCurrentUser();

  // Unknown code — say so plainly rather than bouncing them somewhere odd.
  if (!circle) {
    return (
      <Shell>
        <h1 className="cover-title text-[length:clamp(2rem,7vw,2.8rem)] text-ink-100">
          That invite doesn&apos;t work
        </h1>
        <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-ink-400">
          The code <span className="fig font-semibold tracking-widest text-ink-200">{code}</span>{" "}
          doesn&apos;t match any circle. It may have been rotated by the owner —
          ask them for a fresh link.
        </p>
        <Link href="/circles" className="mt-6 inline-block">
          <Button size="sm">Go to your circles</Button>
        </Link>
      </Shell>
    );
  }

  // Logged out: show what they're joining, then send them to sign in and come
  // straight back here.
  if (!user) {
    return (
      <Shell>
        <p className="plate-label">You&apos;ve been invited to</p>
        <h1 className="cover-title mt-3 text-[length:clamp(2.4rem,8vw,3.4rem)] text-ink-100">
          {circle.name}
        </h1>
        {circle.tagline && (
          <p className="mt-2 font-prose text-lg text-ink-300">{circle.tagline}</p>
        )}
        <p className="mt-4 text-sm text-ink-500">
          {circle._count.memberships}{" "}
          {circle._count.memberships === 1 ? "member" : "members"} ·{" "}
          {circle._count.documents}{" "}
          {circle._count.documents === 1 ? "book" : "books"}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href={`/signup?next=${encodeURIComponent(`/join/${code}`)}`}>
            <Button>Create an account to join</Button>
          </Link>
          <Link href={`/login?next=${encodeURIComponent(`/join/${code}`)}`}>
            <Button variant="outline">I already have one</Button>
          </Link>
        </div>
      </Shell>
    );
  }

  // A removed member must not be able to walk back in through a shared link.
  const banned = await db.moderationAction.findFirst({
    where: { circleId: circle.id, targetId: user.id, action: "remove" },
  });
  if (banned) {
    return (
      <Shell>
        <h1 className="cover-title text-[length:clamp(2rem,7vw,2.8rem)] text-ink-100">
          You can&apos;t rejoin this circle
        </h1>
        <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-ink-400">
          You were removed from {circle.name}. If you think that was a mistake,
          talk to whoever runs it.
        </p>
        <Link href="/circles" className="mt-6 inline-block">
          <Button size="sm">Go to your circles</Button>
        </Link>
      </Shell>
    );
  }

  const existing = await db.membership.findUnique({
    where: { userId_circleId: { userId: user.id, circleId: circle.id } },
  });
  if (!existing) {
    await db.membership.create({
      data: { userId: user.id, circleId: circle.id, role: "member" },
    });
  }

  // Already a member, or just joined — either way, the intent is satisfied.
  redirect(`/circles/${circle.slug}`);
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AuthShell>{children}</AuthShell>
  );
}
