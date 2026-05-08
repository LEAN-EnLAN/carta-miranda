import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LetterEditor } from "@/components/letter-editor";
import { requireCurrentUser } from "@/lib/auth";
import { getLetterDetail } from "@/lib/store";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return { title: "Editar carta — carta-miranda" };
}

export default async function LetterEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const detail = await getLetterDetail(id, user.id);
  if (!detail || !detail.isAuthor) notFound();
  return (
    <div className="min-h-screen">
      <LetterEditor data={detail} />
    </div>
  );
}
