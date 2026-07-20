import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { AuthError, requireUserApi } from "@/lib/auth";
import { assertNotBanned } from "@/lib/circle-governance";
import { db } from "@/lib/db";

const schema = z.object({
  code: z.string().min(4, "Enter an invite code").max(16),
});

/** The only way into a circle. There is no discovery. */
export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const { code } = await parseBody(req, schema);

    const circle = await db.circle.findUnique({
      where: { inviteCode: code.toUpperCase().trim() },
    });
    if (!circle) throw new AuthError("That invite code doesn't match a circle", 404);

    // A removed member must not be able to walk back in with the code.
    await assertNotBanned(user.id, circle.id);

    const existing = await db.membership.findUnique({
      where: { userId_circleId: { userId: user.id, circleId: circle.id } },
    });
    // Re-joining is a no-op, not an error — the user's intent is satisfied.
    if (!existing) {
      await db.membership.create({
        data: { userId: user.id, circleId: circle.id, role: "member" },
      });
    }

    return { slug: circle.slug };
  });
}
