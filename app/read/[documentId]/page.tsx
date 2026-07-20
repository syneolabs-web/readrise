import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getHighlights } from "@/lib/serialize";
import { Reader } from "@/components/reader/Reader";

export default async function ReadPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const user = await requireUser();

  const document = await db.document.findUnique({
    where: { id: documentId },
    include: {
      circle: {
        include: {
          memberships: {
            include: { user: { select: { id: true, name: true, avatarColor: true } } },
          },
        },
      },
      milestones: { orderBy: { order: "asc" } },
      progress: true,
    },
  });

  if (!document) notFound();

  // The gate. A non-member gets 404, not 403 — a private circle shouldn't
  // confirm its own existence.
  const membership = document.circle.memberships.find((m) => m.userId === user.id);
  if (!membership) notFound();

  // Derived server-side: the shoutout control is admin-only AND public-only.
  // Never trust a client flag for a permission.
  const canShoutout = document.circle.isPublic && membership.role === "owner";

  const progressByUser = new Map(document.progress.map((p) => [p.userId, p.currentPage]));

  return (
    <Reader
      documentId={document.id}
      circleId={document.circleId}
      circleSlug={document.circle.slug}
      title={document.title}
      author={document.author}
      pageCount={document.pageCount}
      initialHighlights={await getHighlights(document.id, user.id)}
      initialPage={progressByUser.get(user.id) ?? 1}
      milestones={document.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        startPage: m.startPage,
        endPage: m.endPage,
        order: m.order,
      }))}
      members={document.circle.memberships.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        avatarColor: m.user.avatarColor,
        currentPage: progressByUser.get(m.userId) ?? 1,
      }))}
      viewer={user}
      canShoutout={canShoutout}
    />
  );
}
