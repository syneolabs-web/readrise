import bcrypt from "bcryptjs";
import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { AuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  return apiHandler(async () => {
    const { email, password } = await parseBody(req, schema);

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Same message and same work either way: a distinct "no such user" reply
    // turns this endpoint into an account enumerator.
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !ok) throw new AuthError("Incorrect email or password", 401);

    await createSession(user.id);
    return { ok: true };
  });
}
