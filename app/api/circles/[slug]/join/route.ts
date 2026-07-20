import { apiHandler } from "@/lib/api";
import { AuthError, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Join a PUBLIC circle by slug — no invite code needed. Private circles are
 * never joinable this way (you need the code via /api/circles/join), so a
 * private circle can't be crashed just by guessing its slug.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return apiHandler(async () => {
    const { slug } = await params;
    const user = await requireUserApi();

    const circle = await db.circle.findUnique({ where: { slug } });
    if (!circle) throw new AuthError("Circle not found", 404);
    if (!circle.isPublic) {
      throw new AuthError("That circle is invite-only", 403);
    }

    const existing = await db.membership.findUnique({
      where: { userId_circleId: { userId: user.id, circleId: circle.id } },
    });
    if (!existing) {
      await db.membership.create({
        data: { userId: user.id, circleId: circle.id, role: "member" },
      });
    }

    return { slug: circle.slug };
  });
}
