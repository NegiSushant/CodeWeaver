import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function getAuthenticatedUserId(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const id = parseInt(session.user.id, 10);
  return isNaN(id) ? null : id;
}
