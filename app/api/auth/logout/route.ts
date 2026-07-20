import { apiHandler } from "@/lib/api";
import { destroySession } from "@/lib/session";

export async function POST() {
  return apiHandler(async () => {
    await destroySession();
    return { ok: true };
  });
}
