import { apiHandler } from "@/lib/api";
import { AuthError, requireAuthorOrOwner, requireUserApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { publish } from "@/lib/events";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const user = await requireUserApi();

    const entry = await db.vaultEntry.findUnique({ where: { id } });
    if (!entry) throw new AuthError("Vault entry not found", 404);

    await requireAuthorOrOwner(user.id, entry.circleId, entry.addedById);
    await db.vaultEntry.delete({ where: { id } });

    publish(entry.circleId, { type: "vault:updated", circleId: entry.circleId });

    return { ok: true };
  });
}
