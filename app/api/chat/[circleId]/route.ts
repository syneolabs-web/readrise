import { apiHandler } from "@/lib/api";
import { requireCircleMember, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";

/** Refetch target for the chat panel when the stream signals a new message. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  return apiHandler(async () => {
    const { circleId } = await params;
    const user = await requireUserApi();
    await requireCircleMember(user.id, circleId);

    const url = new URL(req.url);
    const milestoneId = url.searchParams.get("milestoneId");

    const messages = await db.chatMessage.findMany({
      where: { circleId, milestoneId: milestoneId || null },
      orderBy: { createdAt: "asc" },
      take: 200,
      include: { user: { select: { id: true, name: true, avatarColor: true } } },
    });

    return {
      messages: messages.map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        author: m.user,
      })),
    };
  });
}
