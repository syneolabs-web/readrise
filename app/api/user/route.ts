import bcrypt from "bcryptjs";
import { z } from "zod";
import { apiHandler, parseBody } from "@/lib/api";
import { requireUserApi, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(40),
  email: z.string().email("Enter a valid email"),
  avatarColor: z.string().min(1, "Avatar color is required"),
  avatarImage: z.string().nullable().optional(),
  password: z.string().optional(),
});

export async function PATCH(req: Request) {
  return apiHandler(async () => {
    const user = await requireUserApi();
    const body = await parseBody(req, schema);
    const email = body.email.toLowerCase().trim();

    // Check if email changed and is taken
    if (email !== user.email) {
      if (await db.user.findUnique({ where: { email } })) {
        throw new AuthError("An account with that email already exists", 409);
      }
    }

    const updateData: any = {
      email,
      name: body.name.trim(),
      avatarColor: body.avatarColor,
      avatarImage: body.avatarImage !== undefined ? body.avatarImage : undefined,
    };

    if (body.password && body.password.length >= 8) {
      updateData.passwordHash = await bcrypt.hash(body.password, 10);
    } else if (body.password) {
      throw new AuthError("Password must be at least 8 characters", 400);
    }

    await db.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return { ok: true };
  });
}
