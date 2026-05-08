import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";
import { SocialFeedShell } from "@/components/feed/social-feed-shell";
import { HomeSidebar } from "@/components/home-sidebar";
import { LoginPanel } from "@/components/login-panel";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData, getFeedPage, getRelationshipSummary } from "@/lib/store";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "carta-miranda — cartas entre Leandro y Miranda",
    description: "Un archivo de cartas compartidas. Borradores, versiones y huellas de una conversación a dos voces.",
  };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ error?: string; view?: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    const params = await searchParams;
    return (
      <div className="min-h-screen">
        <LoginPanel error={params.error ? "Credenciales inválidas" : undefined} />
      </div>
    );
  }

  const params = await searchParams;
  if ((params.view ?? "feed") !== "legacy") {
    const [initialPage, relationship, data] = await Promise.all([
      getFeedPage(user.id),
      getRelationshipSummary(user.id),
      getDashboardData(user.id),
    ]);
    return (
      <div className="min-h-screen">
        <SocialFeedShell
          initialPage={initialPage}
          relationship={relationship}
        >
          <HomeSidebar data={data} />
        </SocialFeedShell>
      </div>
    );
  }

  const data = await getDashboardData(user.id);
  return (
    <div className="min-h-screen">
      <Dashboard data={data} />
    </div>
  );
}
