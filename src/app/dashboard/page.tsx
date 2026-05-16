import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { getDashboardData } from "@/lib/dashboard";
import { getCurrentUserFromCookies } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUserFromCookies();
  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardData();
  return <Dashboard data={data} />;
}
