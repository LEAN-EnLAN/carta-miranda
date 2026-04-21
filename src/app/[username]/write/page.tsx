import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { WriteForm } from "@/components/write-form";
import type { AccountId } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WritePage({ params }: { params: Promise<{ username: string }> }) {
  const user = await requireCurrentUser();
  const { username } = await params;
  if (username !== "leandro" && username !== "miranda") notFound();

  const recipientId = username as AccountId;
  if (recipientId === user.id) notFound();

  return <WriteForm recipientId={recipientId} />;
}
