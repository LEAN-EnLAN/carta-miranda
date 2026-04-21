import { notFound } from "next/navigation";
import { LetterEditor } from "@/components/letter-editor";
import { requireCurrentUser } from "@/lib/auth";
import { getLetterDetail } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LetterEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const detail = await getLetterDetail(id, user.id);
  if (!detail || !detail.isAuthor) notFound();
  return <LetterEditor data={detail} />;
}
