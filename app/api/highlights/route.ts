import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { requireDocumentAccess, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";
import { HIGHLIGHT_COLORS } from "@/lib/types";

/**
 * Rects are validated as 0..1 fractions, not pixels. If a client ever sends
 * viewport coordinates (the classic mistake this whole design exists to
 * prevent), the schema rejects them at the boundary rather than silently
 * storing a highlight that renders in the wrong place on every other screen.
 */
const rect = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
});

const schema = z.object({
  documentId: z.string().min(1),
  pageNumber: z.number().int().positive(),
  rects: z.array(rect).min(1, "A highlight needs at least one rect").max(200),
  textContent: z.string().min(1).max(5000),
  textStart: z.number().int().min(0).default(0),
  textEnd: z.number().int().min(0).default(0),
  color: z.enum(HIGHLIGHT_COLORS).default("yellow"),
});

export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const body = await parseBody(req, schema);
    const document = await requireDocumentAccess(user.id, body.documentId);

    const highlight = await db.highlight.create({
      data: {
        documentId: document.id,
        userId: user.id,
        pageNumber: body.pageNumber,
        rects: body.rects,
        textContent: body.textContent,
        textStart: body.textStart,
        textEnd: body.textEnd,
        color: body.color,
      },
    });

    publish(document.circleId, {
      type: "highlight:created",
      documentId: document.id,
      highlightId: highlight.id,
    });

    return { id: highlight.id };
  });
}
