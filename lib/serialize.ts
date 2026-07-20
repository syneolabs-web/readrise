import { db } from "./db";
import { parseRects } from "./anchor";
import type { HighlightColor, NormalizedRect } from "./types";

/**
 * The wire shape for annotations. Defined once and used by BOTH the server
 * component's initial render and the SSE-triggered refetch, so a live update
 * can never disagree with a page reload.
 */

export type CommentDTO = {
  id: string;
  body: string;
  createdAt: string;
  parentId: string | null;
  author: { id: string; name: string; avatarColor: string };
  voteCount: number;
  votedByMe: boolean;
};

export type HighlightDTO = {
  id: string;
  pageNumber: number;
  rects: NormalizedRect[];
  textContent: string;
  color: HighlightColor;
  createdAt: string;
  author: { id: string; name: string; avatarColor: string };
  comments: CommentDTO[];
  inVault: boolean;
};

export async function getHighlights(
  documentId: string,
  viewerId: string
): Promise<HighlightDTO[]> {
  const rows = await db.highlight.findMany({
    where: { documentId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, avatarColor: true } },
      vaultEntries: { select: { id: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, avatarColor: true } },
          votes: { select: { userId: true } },
        },
      },
    },
  });

  return rows.map((h) => ({
    id: h.id,
    pageNumber: h.pageNumber,
    rects: parseRects(h.rects),
    textContent: h.textContent,
    color: h.color as HighlightColor,
    createdAt: h.createdAt.toISOString(),
    author: h.user,
    inVault: h.vaultEntries.length > 0,
    comments: h.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      parentId: c.parentId,
      author: c.user,
      voteCount: c.votes.length,
      votedByMe: c.votes.some((v) => v.userId === viewerId),
    })),
  }));
}
