import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { AuthError, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateInviteCode, slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

export async function POST(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const { name } = await parseBody(req, schema);

    const base = slugify(name);
    if (!base) throw new AuthError("Use at least some letters or numbers", 400);

    // Slugs are global, so a friendly name may collide with another circle's.
    let slug = base;
    for (let i = 2; await db.circle.findUnique({ where: { slug } }); i++) {
      slug = `${base}-${i}`;
    }

    const circle = await db.circle.create({
      data: {
        name: name.trim(),
        slug,
        inviteCode: generateInviteCode(),
        memberships: { create: { userId: user.id, role: "owner" } },
      },
    });

    return { slug: circle.slug };
  });
}
