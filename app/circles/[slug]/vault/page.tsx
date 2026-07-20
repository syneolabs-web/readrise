import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { CircleNav } from "@/components/CircleNav";
import { VaultList } from "./VaultList";

/**
 * The Insight Vault: a shared, searchable index of everything the circle
 * decided was worth keeping — across every book they've ever read.
 *
 * Perusall's annotations die with the course. Fable's chat scrolls away.
 * This is the artifact that survives the reading.
 */
export default async function VaultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();

  const circle = await db.circle.findUnique({
    where: { slug },
    include: { memberships: { select: { userId: true } } },
  });
  if (!circle) notFound();
  if (!circle.memberships.some((m) => m.userId === user.id)) notFound();

  const entries = await db.vaultEntry.findMany({
    where: { circleId: circle.id },
    orderBy: { createdAt: "desc" },
    include: {
      addedBy: { select: { id: true, name: true, avatarColor: true } },
      highlight: {
        include: {
          document: { select: { id: true, title: true, author: true } },
          user: { select: { name: true } },
          comments: {
            take: 3,
            orderBy: { createdAt: "asc" },
            include: { user: { select: { name: true } } },
          },
        },
      },
      microAction: {
        include: { checkins: { select: { userId: true } } },
      },
    },
  });

  return (
    <>
      <AppHeader user={user}>
        <CircleNav slug={slug} name={circle.name} active="vault" />
      </AppHeader>

      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Insight Vault</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-500">
            Everything {circle.name} decided was worth keeping, indexed across every
            book. Your circle&apos;s second brain — searchable, permanent, private.
          </p>
        </div>

        <VaultList
          viewerId={user.id}
          entries={entries.map((e) => ({
            id: e.id,
            note: e.note,
            createdAt: e.createdAt.toISOString(),
            addedBy: e.addedBy,
            highlight: e.highlight
              ? {
                  id: e.highlight.id,
                  text: e.highlight.textContent,
                  color: e.highlight.color,
                  page: e.highlight.pageNumber,
                  author: e.highlight.user.name,
                  documentId: e.highlight.document.id,
                  documentTitle: e.highlight.document.title,
                  documentAuthor: e.highlight.document.author,
                  comments: e.highlight.comments.map((c) => ({
                    author: c.user.name,
                    body: c.body,
                  })),
                }
              : null,
            action: e.microAction
              ? {
                  title: e.microAction.title,
                  detail: e.microAction.detail,
                  weekOf: e.microAction.weekOf,
                  checkins: e.microAction.checkins.length,
                }
              : null,
          }))}
        />
      </main>
    </>
  );
}
