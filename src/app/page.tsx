import { Dashboard } from "@/components/dashboard";
import { LoginPanel } from "@/components/login-panel";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    const params = await searchParams;
    return <LoginPanel error={params.error ? "Credenciales invalidas" : undefined} />;
  }

  const data = await getDashboardData(user.id);
  return <Dashboard data={data} />;
}
