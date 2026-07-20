import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { AuthError } from "./auth";

/**
 * One error-translation layer for every mutation route, so route handlers can
 * just throw AuthError / ZodError and stay linear.
 */
export function apiHandler<T>(fn: () => Promise<T>) {
  return fn()
    .then((data) => NextResponse.json(data ?? { ok: true }))
    .catch((err: unknown) => {
      if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: err.errors[0]?.message ?? "Invalid input" },
          { status: 400 }
        );
      }
      console.error("[api]", err);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    });
}

/** Parse a JSON body against a schema. Malformed JSON reads as empty. */
export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  const json = await req.json().catch(() => ({}));
  return schema.parse(json);
}
