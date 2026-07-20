import bcrypt from "bcryptjs";
import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { AuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import { pickAvatarColor } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(40),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  return apiHandler(async () => {
    const body = await parseBody(req, schema);
    const email = body.email.toLowerCase().trim();

    if (await db.user.findUnique({ where: { email } })) {
      throw new AuthError("An account with that email already exists", 409);
    }

    const user = await db.user.create({
      data: {
        email,
        name: body.name.trim(),
        passwordHash: await bcrypt.hash(body.password, 10),
        avatarColor: pickAvatarColor(email),
      },
    });

    await createSession(user.id);
    return { ok: true };
  });
}
